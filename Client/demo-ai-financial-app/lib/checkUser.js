import { createUserIfNew } from "@/actions/user";
import { currentUser } from "@clerk/nextjs/server";

export const checkUser = async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  try {
    const name = `${user.firstName} ${user.lastName}`;
    const data = {
      clerkUserId: user.id,
      name,
      imageUrl: user.imageUrl,
      email: user.emailAddresses[0].emailAddress,
    };

    const newUser = await createUserIfNew(data);

    return newUser;
  } catch (error) {
    console.log(error.message);
  }
};
