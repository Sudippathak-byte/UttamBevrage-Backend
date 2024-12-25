import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../database/models/User";
import { AuthRequest, Role } from "../middleware/authMiddleware";
import Order from "../database/models/Order";
import OrderDetail from "../database/models/OrderDetails";
import Product from "../database/models/Product";
import Payment from "../database/models/Payment";

class AuthController {
  public static async registerUser(req: Request, res: Response) {
    const { email, username, password, bestSports, bestActor, idol } = req.body;
  
    if (!email || !username || !password || !bestSports || !bestActor || !idol) {
      res.status(400).json({
        message: "Please provide all required fields",
      });
      return;
    }
  
    const existingUser = await User.findOne({ where: { email } });
  
    if (existingUser) {
      res.status(400).json({
        message: "User with this email already exists",
      });
      return;
    }
  
    const hashedPassword = bcrypt.hashSync(password, 12);
  
    const newUser = await User.create({
      email,
      username,
      password: hashedPassword,
      role: "customer",
      bestSports,
      bestActor,
      idol,
    });
  
    const token = jwt.sign({ id: newUser.id }, process.env.SECRET_KEY as string, {
      expiresIn: "1h",
    });
  
    res.status(201).json({
      message: "User registered successfully",
      token,
    });
  }
  

  public static async loginUser(req: Request, res: Response) {
    const { email, password } = req.body;
  
    if (!email || !password) {
      res.status(400).json({
        message: "Please provide email and password",
      });
      return;
    }
  
    const user = await User.findOne({ where: { email } });
  
    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }
  
    const isPasswordValid = bcrypt.compareSync(password, user.password);
  
    if (!isPasswordValid) {
      res.status(403).json({
        message: "Invalid password",
      });
      return;
    }
  
    const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY as string, {
      expiresIn: "1h",
    });
  
    res.status(200).json({
      message: "User logged in successfully",
      token,
    });
  }
  

  public static async requestPasswordReset(
    req: Request,
    res: Response
  ): Promise<void> {
    const { email, bestSports, bestActor, idol } = req.body;

    if (!email || !bestSports || !bestActor || !idol) {
      res.status(400).json({
        message: "Please provide email and answers to all security questions",
      });
      return;
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      res.status(404).json({
        message: "No user with that email",
      });
      return;
    }

    if (
      user.bestSports !== bestSports ||
      user.bestActor !== bestActor ||
      user.idol !== idol
    ) {
      res.status(403).json({
        message: "Security answers do not match",
      });
      return;
    }

    // Generate token for resetting password
    const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY as string, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Security answers verified. Use this token to reset password.",
      token,
    });
  }

  public static async resetPassword(req: Request, res: Response): Promise<void> {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({
        message: "Please provide token and new password",
      });
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY as string) as {
        id: string;
      };

      const user = await User.findByPk(decoded.id);

      if (!user) {
        res.status(404).json({
          message: "User not found",
        });
        return;
      }

      user.password = bcrypt.hashSync(newPassword, 12);
      await user.save();

      res.status(200).json({
        message: "Password reset successfully",
      });
    } catch (error) {
      res.status(400).json({
        message: "Invalid or expired token",
      });
    }
  }

  public static async verifySecurityQuestions(req: Request, res: Response) {
    const { email, bestSports, bestActor, idol } = req.body;

    if (!email || !bestSports || !bestActor || !idol) {
      res.status(400).json({
        message: "Please provide email and answers to all security questions",
      });
      return;
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      res.status(404).json({
        message: "No user with that email",
      });
      return;
    }

    if (
      user.bestSports !== bestSports ||
      user.bestActor !== bestActor ||
      user.idol !== idol
    ) {
      res.status(403).json({
        message: "Security answers do not match",
      });
      return;
    }

    res.status(200).json({
      message: "Security answers verified",
    });
  }

  public static async deleteUser(req: AuthRequest, res: Response): Promise<void> {
    const { id, email, bestSports, bestActor, idol } = req.body;

    if (!id || !email || !bestSports || !bestActor || !idol) {
      res.status(400).json({
        message: "Please provide id, email, and answers to all security questions",
      });
      return;
    }

    const user = await User.findOne({ where: { id, email } });

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    if (
      user.bestSports !== bestSports ||
      user.bestActor !== bestActor ||
      user.idol !== idol
    ) {
      res.status(403).json({
        message: "Security answers do not match",
      });
      return;
    }

    await user.destroy();

    res.status(200).json({
      message: "User deleted successfully",
    });
  }

  public static async fetchUsers(req: AuthRequest, res: Response): Promise<void> {
    const { email, bestSports, bestActor, idol } = req.body;

    if (!email || !bestSports || !bestActor || !idol) {
      res.status(400).json({
        message: "Please provide email and answers to all security questions",
      });
      return;
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    if (
      user.bestSports !== bestSports ||
      user.bestActor !== bestActor ||
      user.idol !== idol
    ) {
      res.status(403).json({
        message: "Security answers do not match",
      });
      return;
    }

    const users = await User.findAll();

    res.status(200).json({
      message: "Users fetched successfully",
      data: users,
    });
  }

  public static async updateUser(req: AuthRequest, res: Response): Promise<void> {
    const { id, email, bestSports, bestActor, idol } = req.body;

    if (!id || !email || !bestSports || !bestActor || !idol) {
      res.status(400).json({
        message: "Please provide id, email, and answers to all security questions",
      });
      return;
    }

    const user = await User.findOne({ where: { id, email } });

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    if (
      user.bestSports !== bestSports ||
      user.bestActor !== bestActor ||
      user.idol !== idol
    ) {
      res.status(403).json({
        message: "Security answers do not match",
      });
      return;
    }

    // Update user details
    Object.assign(user, req.body);

    await user.save();

    res.status(200).json({
      message: "User updated successfully",
      data: user,
    });
  }

  public static async getUserDetails(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.params.id;
    if (!userId) { 
      res.status(400).json({
      message: "Please provide a user ID"
        , });
      return;
      }
           
      const user = await User.findByPk(userId, {
      include: [
      { 
      model: Order,
      include: [
       { 
         model: OrderDetail,
         include: [Product],
       },
       {
         model: Payment,
       },
     ],
    },
  ],
});
if (!user) {
 res.status(404).json({
  message: "User not found",
  });
   return; 
    }
   res.status(200).json({
    message: "User fetched successfully", data: user, }); } 
}

export default AuthController;
