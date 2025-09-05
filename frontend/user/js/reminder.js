;(() => {
  const $ = (sel, root=document) => root.querySelector(sel)
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel))

  const state = {
    reminders: [],
    filter: { q:'', category:'', status:'' },
    timers: new Map(),
  }

  // Auth: stop executing after redirect to avoid null refs
  let token = localStorage.getItem("token")
  if (!token) { window.location.href = "login.html";
        return }

  const uid = () => Math.random().toString(36).slice(2,9)
  const fmtDate = iso =>
    new Date(iso).toLocaleString([], {
      hour: '2-digit',
      minute: '2-digit',
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    })

  const isToday = iso => {
    const d = new Date(iso), n = new Date()
    return d.getFullYear()===n.getFullYear() && d.getMonth()===n.getMonth() && d.getDate()===n.getDate()
  }

  // Helpers to handle <input type="datetime-local"> 
  const toInputValue = (date) => {
    const d = new Date(date)
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset()) 
    return d.toISOString().slice(0,16)
  }
  // Request notification permission once 
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().catch(()=>{})
  }
  //  Load reminders from backend
  async function loadReminders() {
    try {
      const res = await fetch("http://localhost:5000/api/reminders", {
        headers: { "Authorization": "Bearer " + token }
      })
      if (!res.ok) throw new Error("Failed to load reminders")
      const data = await res.json()
      state.reminders = data.map(r => ({
        id: r._id,
        title: r.title,
        category: r.category,
        datetime: r.datetime,   
        repeat: r.repeat,
        channel: r.channel,
        notes: r.notes || '',
        completed: r.status === 'done',
      }))
    } catch (err) {
      console.error("Error loading reminders:", err)
      state.reminders = []
    } finally {
      render()
      scheduleAll()
    }
  }
  function scheduleAll() {
    state.timers.forEach(t => clearTimeout(t))
    state.timers.clear()
    state.reminders.filter(r=>!r.completed).forEach(scheduleOne)
  }

  function scheduleOne(r) {
    const when = new Date(r.datetime).getTime() - Date.now()
    if (when <= 0) return
    const t = setTimeout(()=> maybeNotify(r), Math.min(when, 2**31 - 1))
    state.timers.set(r.id, t)
  }

  function maybeNotify(r) {
    if (r.channel==='push' && 'Notification' in window && Notification.permission==='granted') {
      new Notification('Reminder: ' + r.title, {
        body:`${r.category} • ${fmtDate(r.datetime)}`,
        tag:r.id
      })
    }
  }

  // CRUD helpers
  async function saveReminder(rem) {
    try {
      const payload = {
        title: rem.title,
        category: rem.category,
        datetime: rem.datetime, 
        repeat: rem.repeat,
        channel: rem.channel,
        notes: rem.notes
      }
      let res
      if (rem.id.startsWith('local-')) {
        res = await fetch("http://localhost:5000/api/reminders", {
          method: "POST",
          headers: {"Content-Type":"application/json","Authorization":"Bearer "+token},
          body: JSON.stringify(payload)
        })
      } else {
        res = await fetch(`http://localhost:5000/api/reminders/${rem.id}`, {
          method: "PUT",
          headers: {"Content-Type":"application/json","Authorization":"Bearer "+token},
          body: JSON.stringify(payload)
        })
      }
      if (!res.ok) throw new Error("Failed to save reminder")
      const data = await res.json()
      rem.id = data._id
      rem.completed = data.status==='done'
      upsertState(rem)
    } catch(err){
      console.error("Error saving reminder:", err)
    }
  }

  async function deleteReminder(rem) {
    if (rem.id.startsWith('local-')) return removeState(rem.id)
    try {
      const res = await fetch(`http://localhost:5000/api/reminders/${rem.id}`, {
        method: "DELETE",
        headers: {"Authorization":"Bearer "+token}
      })
      if (!res.ok) throw new Error("Failed to delete reminder")
      removeState(rem.id)
    } catch(err){
      console.error("Error deleting reminder:", err)
    }
  }

  function upsertState(rem) {
    const idx = state.reminders.findIndex(r=>r.id===rem.id)
    if (idx>-1) state.reminders[idx] = rem
    else state.reminders.push(rem)
    render()
    scheduleAll()
  }

  function removeState(id) {
    state.reminders = state.reminders.filter(r=>r.id!==id)
    render()
    scheduleAll()
  }

  // Rendering
  function render() {
    const listEl = $('#list')
    const calEl = $('#calendar')
    if (!listEl || !calEl) return

    listEl.innerHTML = ''
    calEl.innerHTML = ''

    const filtered = state.reminders.filter(r=>{
      const q = state.filter.q.toLowerCase()
      const matchQ = !q || r.title.toLowerCase().includes(q) || (r.notes||'').toLowerCase().includes(q)
      const matchCat = !state.filter.category || r.category===state.filter.category
      const now = Date.now()
      const overdue = !r.completed && new Date(r.datetime).getTime() < now
      const status = r.completed ? 'done' : overdue ? 'overdue' : 'pending'
      const matchStatus = !state.filter.status || state.filter.status===status
      return matchQ && matchCat && matchStatus
    }).sort((a,b)=> new Date(a.datetime) - new Date(b.datetime))

    const emptyTpl = $('#emptyTpl')
    if (!filtered.length && emptyTpl && emptyTpl.content) {
      listEl.appendChild(emptyTpl.content.cloneNode(true))
    } else {
      for (const r of filtered) {
        const overdue = !r.completed && new Date(r.datetime).getTime() < Date.now()
        const dueSoon = !r.completed && !overdue && (new Date(r.datetime).getTime() - Date.now()) < 30*60*1000
        const item = document.createElement('div')
        item.className = 'item' + (r.completed ? ' done' : '')
        item.setAttribute('data-id', r.id)
        item.innerHTML = `
          <div class="left">
            <div class="pill" aria-hidden="true">${iconFor(r.category)}</div>
            <div>
              <div class="title">${escapeHTML(r.title)}</div>
              <div class="meta ${overdue? 'overdue':''} ${dueSoon? 'due-soon':''}">
                ${escapeHTML(r.category)} • ${fmtDate(r.datetime)} ${isToday(r.datetime)?'(today)':''}
              </div>
              ${r.notes ? `<div class="muted" style="font-size:13px;margin-top:4px">${escapeHTML(r.notes)}</div>`:''}
            </div>
          </div>
          <div class="actions">
            ${!r.completed? `<button data-act="done" class="primary" aria-label="Mark as done">Mark done</button>` : ''}
            <button data-act="snooze" title="Snooze 10 min" aria-label="Snooze">Snooze</button>
            <button data-act="edit" aria-label="Edit reminder">Edit</button>
            <button data-act="delete" aria-label="Delete reminder">Delete</button>
          </div>`
        listEl.appendChild(item)
      }
    }
function maybeNotify(r) {
  if (r.channel === 'push' && 'Notification' in window && Notification.permission === 'granted') {
    new Notification('Reminder: ' + r.title, {
      body: `${r.category} • ${fmtDate(r.datetime)}\n${r.notes || ''}`,
      tag: r.id
    });
  }
}
    // Calendar rendering 
    const now = new Date()
    const last = new Date(now.getFullYear(), now.getMonth()+1, 0)
    for (let d=1; d<=last.getDate(); d++){
      const day = document.createElement('div')
      day.className = 'day'
      const date = new Date(now.getFullYear(), now.getMonth(), d)
      const has = state.reminders.some(r=>{
        const rd = new Date(r.datetime)
        return rd.getFullYear()===date.getFullYear() && rd.getMonth()===date.getMonth() && rd.getDate()===date.getDate()
      })
      day.textContent = d + (has ? ' •' : '')
      if (date.toDateString() === new Date().toDateString()) day.classList.add('today')
      calEl.appendChild(day)
    }
  }

  function iconFor(cat){ return {Nutrition:'🍎', Hydration:'💧', Medication:'💊', Appointment:'🩺', Exercise:'🧘'}[cat]||'⏰' }
  function escapeHTML(str){ return (str ?? '').toString().replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m])) }

  // Safe addEventListener helper
  const on = (el, evt, fn) => el && el.addEventListener && el.addEventListener(evt, fn)

  // UI event listeners
  on($('#addBtn'), 'click', ()=> openModal())
  on($('#closeModal'), 'click', closeModal)
  on($('#cancelBtn'), 'click', closeModal)

  on($('#reminderForm'), 'submit', e=>{
    e.preventDefault()
    const rawDate = $('#datetime')?.value
    if (!rawDate) { alert("Please select a valid date and time."); return }
    const id = $('#reminderId').value || 'local-'+uid()
    const iso = new Date(rawDate).toISOString()
    const rem = {
      id,
      title: $('#title').value.trim(),
      category: $('#category').value,
      datetime: iso,
      repeat: $('#repeat').value,
      channel: $('#channel').value,
      notes: $('#notes').value.trim(),
      completed:false
    }
    saveReminder(rem)
    closeModal()
  })

  on($('#list'), 'click', e=>{
    const btn = e.target.closest('button')
    if (!btn) return
    const item = e.target.closest('.item')
    const id = item?.getAttribute('data-id')
    const r = state.reminders.find(x=>x.id===id)
    if (!r) return
    const act = btn.dataset.act
    if (act==='done'){ r.completed=true; saveReminder({...r}) }
    if (act==='delete'){ deleteReminder(r) }
    if (act==='edit'){ openModal(r) }
    if (act==='snooze'){
      r.datetime = new Date(new Date(r.datetime).getTime()+10*60*1000).toISOString()
      r.completed=false
      saveReminder({...r})
    }
  })
  // Safe menu toggle
  const menuToggle = document.getElementById('menu-toggle')
  const navLinks = document.getElementById('nav-links')
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active')
    })
  }

  on($('#search'), 'input', e=>{ state.filter.q = e.target.value; render() })
  on($('#filterCategory'), 'change', e=>{ state.filter.category = e.target.value; render() })
  on($('#filterStatus'), 'change', e=>{ state.filter.status = e.target.value; render() })

  function openModal(data){
    $('#modalTitle').textContent = data?.id ? 'Edit Reminder':'Add Reminder'
    $('#reminderId').value = data?.id||''
    $('#title').value = data?.title||''
    $('#category').value = data?.category||'Nutrition'
    const dt = data?.datetime ? new Date(data.datetime) : new Date(Date.now()+30*60*1000)
    $('#datetime').value = toInputValue(dt) 
    $('#repeat').value = data?.repeat||'once'
    $('#channel').value = data?.channel||'push'
    $('#notes').value = data?.notes||''
    $('#modal').showModal()
  }
  function closeModal(){ $('#modal').close() }
  loadReminders()
})()
