import type { Request, Response } from 'express';
import * as chatService from '../services/chat.js';
import { sendSuccess } from '../utils/response.js';

export const getMessages = async (req: Request, res: Response) => {
    const id = req.params['id'] as string;
    const messages = await chatService.getMessages(id, req.user!.userId);

    return sendSuccess(res, messages);
};

export const sendMessage = async (req: Request, res: Response) => {
    const id = req.params['id'] as string;
    const message = await chatService.sendMessage(id, req.user!.userId, req.body);

    return sendSuccess(res, message);
};
