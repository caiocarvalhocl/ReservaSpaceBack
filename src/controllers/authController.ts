import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/user';
import { config } from '../config';

export const register = async (req: Request, res: Response) => {
  const { name, email, password, phone } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      status: 'active',
      role: 'regular',
    });

    const userResponse = newUser.toJSON();
    delete userResponse.password;

    const { id, role } = userResponse;

    res.status(201).json({ user: { id, name, role } });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (user.status !== 'active')
      return res.status(403).json({ message: 'User is not  actived' });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, config.jwtSecret, {
      expiresIn: '1h',
    });

    const { id, name, role } = user;

    res.status(200).json({ user: { id, name, role }, token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};
