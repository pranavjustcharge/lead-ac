import mongoose from 'mongoose';

const dbConnection = async (URL:string) => {
  try {
    await mongoose
      .connect(URL)
      .then(() => {
        console.log(`MongoDB connected:`);
      })
      .catch((err) => {
        console.log(`MongoDB error: ${err}`);
      });
  } catch (error) {
    console.log(`server error: ${error}`);
  }
};

export default dbConnection;