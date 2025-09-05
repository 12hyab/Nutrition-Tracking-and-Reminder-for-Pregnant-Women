import cron from 'node-cron';
import Reminder from './models/Reminder.js';
import User from './models/User.js';
import { sendNotification } from './notification.js';

cron.schedule('* * * * *', async () => {
  const now = new Date();
  const dueReminders = await Reminder.find({
    status: 'pending',
    datetime: { $lte: now }
  }).populate('user');

  for(const rem of dueReminders){
    await sendNotification(rem, rem.user);
    rem.status = 'done'; // mark as sent
    await rem.save();
  }
});
