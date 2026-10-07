import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import { ApiError, formatResponse } from '../utils/ApiError';

const generateToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '7d' });
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fullName, email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      // 409 Conflict for duplicate resource
      return next(new ApiError(409, 'Email is already registered'));
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        email: normalizedEmail,
        passwordHash
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    });

    const token = generateToken(user.id);

    res.status(201).json(formatResponse(true, 'User registered successfully', { user, token }));
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      return next(new ApiError(401, 'Invalid email or password'));
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return next(new ApiError(401, 'Invalid email or password'));
    }

    const token = generateToken(user.id);

    const safeUser = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json(formatResponse(true, 'Login successful', { user: safeUser, token }));
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return next(new ApiError(401, 'Unauthorized'));
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    res.json(formatResponse(true, 'Current user retrieved', { user }));
  } catch (error) {
    next(error);
  }
};

export const logout = (req: Request, res: Response) => {
  // Since we are using stateless JWTs, we cannot invalidate the token on the server.
  // The client is responsible for deleting the token from storage (e.g., SecureStore/localStorage).
  res.json(formatResponse(true, 'Logged out successfully. Client must remove token.'));
};
