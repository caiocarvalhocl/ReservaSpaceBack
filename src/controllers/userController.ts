import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/user';

interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ message: 'Server error fetching user' });
  }
};

export const getMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching my profile:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

export const updateMultipleUsers = async (req: AuthRequest, res: Response) => {
  try {
    const updates: { id: number; [key: string]: any }[] = req.body;

    if (!Array.isArray(updates) || updates.length === 0) return res.status(400).json({ message: 'Invalid payload' });

    for (const update of updates) {
      const { id, ...fields } = update;

      const user = await User.findByPk(id);

      if (!user) return res.status(400).json({ message: 'User not found' });

      Object.keys(fields).forEach(key => {
        const isKeyValid = key !== 'password' && key !== 'id';
        if (isKeyValid) (user as any)[key] = fields[key];
      });

      await user.save();
    }
    return res.status(200).json({ message: 'Update completed' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

export const createUser = async (req: AuthRequest, res: Response) => {
  const { name, email, password, phone, role } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
      status: 'active',
    });

    res.status(201).json({ message: 'User created' });
  } catch (error) {
    console.error('Error during creation:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};
