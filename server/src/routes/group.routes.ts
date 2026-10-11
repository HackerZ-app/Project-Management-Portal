import { Router } from 'express';
import {
  createGroup,
  searchPeers,
  inviteMember,
  acceptInvite,
  declineInvite,
  lockGroup,
  unlockGroup,
  getMyGroups,
} from '../controllers/group.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// Student group endpoints
router.post('/', verifyToken, createGroup);
router.get('/me', verifyToken, getMyGroups);
router.get('/my', verifyToken, getMyGroups);
router.get('/peers', verifyToken, searchPeers);
router.get('/peers/search', verifyToken, searchPeers);
router.post('/:id/invite', verifyToken, inviteMember);
router.post('/:id/invites', verifyToken, inviteMember);
router.put('/:id/accept', verifyToken, acceptInvite);
router.put('/:id/decline', verifyToken, declineInvite);
router.put('/:id/invites/:inviteId/respond', verifyToken, (req, res, next) => {
  if (req.body.action === 'accept') {
    return acceptInvite(req, res, next);
  } else {
    return declineInvite(req, res, next);
  }
});
router.put('/:id/lock', verifyToken, lockGroup);
router.put('/:id/unlock', verifyToken, unlockGroup);

export default router;
