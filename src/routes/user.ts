import { Request, Response, Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User, { IUser, UserResponse } from '../models/userModels';

const router = Router();

// Register a new user
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password,name } = req.body;

    // Check if the email is already in use
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the user
    const user: IUser = new User({
      email,
      password: hashedPassword,
      name:name,
    });
    await user.save();

    const userResponse:UserResponse = {email:user.email,name:user.name}

    res.status(201).json({user:userResponse});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login a user
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists
    const user: IUser | null = await User.findOne({ email });
    if (!user) {
      console.log("returning no email")
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare the passwords
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate a JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!);

    const userResponse:UserResponse = {name:user.name,email:user.email};
    res.status(200).json({ token,user:userResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
