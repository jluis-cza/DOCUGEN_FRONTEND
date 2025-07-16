//General Rules

// For imput data
export const RULES = {
  input: {
    // Empty text values
    required: (value) => {
      // if (value) {
      //   return true;
      // } else {
      //   return 'No entry';
      // }

      return value? true: 'No entry'
    },
    //Non-valid email address
    email: (value) => {
      if (value) {
        const isValidFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        return isValidFormat || 'Invalid Email';
      } else {
        return 'No entry';
      }
    },
  },
};
