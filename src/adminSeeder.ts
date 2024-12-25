import User from "./database/models/User";
import bcrypt from "bcrypt";

const adminseeder = async (): Promise<void> => {
  const [data] = await User.findAll({
    where: {
      email: "p2admin@gmail.com",
    },
  });
  if (!data) {
    await User.create({
      email: "p2admin@gmail.com",
      password: bcrypt.hashSync("p2password", 8),
      username: "p2admin",
      role: 'admin',
      bestActor: "Rajesh Hamal",
      bestSports: "football",
      idol: "Balen"
    });
    console.log("admin credentials seeded successfully");
  } else {
    console.log("admin credentials already seeded");
  }
};

export default adminseeder;
