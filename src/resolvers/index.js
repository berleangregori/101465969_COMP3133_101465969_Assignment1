const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Employee = require("../models/Employee");
require("dotenv").config();

const resolvers = {
  Query: {
    login: async (_, { username, email, password }) => {
      const user = await User.findOne({ $or: [{ username }, { email }] });
      if (!user) throw new Error("User not found");

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) throw new Error("Invalid credentials");

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
      return { token, user };
    },

    getAllEmployees: async () => await Employee.find(),

    searchEmployeeByEid: async (_, { eid }) => await Employee.findById(eid),

    searchEmployeeByDesignationOrDepartment: async (_, { designation, department }) => {
      return await Employee.find({ $or: [{ designation }, { department }] });
    },
  },

  Mutation: {
    signup: async (_, { username, email, password }) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({ username, email, password: hashedPassword });
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
      return { token, user };
    },

    addEmployee: async (_, args) => await Employee.create(args),

    updateEmployee: async (_, { eid, ...updates }) => {
      return await Employee.findByIdAndUpdate(eid, updates, { new: true });
    },

    deleteEmployee: async (_, { eid }) => {
      await Employee.findByIdAndDelete(eid);
      return "Employee deleted successfully";
    },
  },
};

module.exports = resolvers;
