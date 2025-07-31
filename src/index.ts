import express from 'express';
import { getAllUsers } from './functions/getAllUsers';
import { getUserReferrals } from './functions/getUserReferrals';
import { getUserReferralInfo } from './functions/getUserReferralInfo';
import { validateReferralCode } from './functions/validateReferralCode';
import { createReferral } from './functions/createReferral';

const port = process.env.port || 8080;
const app = express();

app.get('/referrals/:id', validateReferralCode);
app.post('/referrals', createReferral);
app.get('/users/:id/referral-stats', getUserReferralInfo);
app.get('/users/:id/referrals', getUserReferrals);
app.get('/users', getAllUsers);

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})