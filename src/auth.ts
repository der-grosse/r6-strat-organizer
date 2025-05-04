"use server";

export async function checkCredentials(password: string) {
  return password === process.env.APP_SECRET;
}
