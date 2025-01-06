import bcrypt from "bcrypt";

const saltRounds = 10;
const myPlaintextPassword =
  "YKn.T71XkiHCuL00V2llDx8rzs5d4564lx$12$w6WIy3Oi/usTqoFXSLe2kwM/sUOVoPDy";
const someOtherPlaintextPassword = "not_bacon";

//* To hash a password
//# Technique 1 (generate a salt and hash on separate function calls):
bcrypt.genSalt(saltRounds, function (err, salt) {
  bcrypt.hash(myPlaintextPassword, salt, function (err, hash) {
    // Store hash in your password DB.
  });
});

//# Technique 2 (auto-gen a salt and hash):
bcrypt.hash(myPlaintextPassword, saltRounds, function (err, hash) {
  // Store hash in your password DB.
});

// Example
const createHashPassword = async password => {
  // Old technique:
  const mySalt = await bcrypt.genSalt(10);
  const result1 = await bcrypt.hash(password, mySalt);

  // New technique:
  const result2 = await bcrypt.hash(password, 10);

  // Check received password from user
  const compareResult1 = await bcrypt.compare(password, result2);
  console.log("compareResult1:::", compareResult1); // true

  const compareResult2 = await bcrypt.compare("111", result2);
  console.log("compareResult2:::", compareResult2); // false
};

createHashPassword("1234567");

//* To check a password
// Load hash from your password DB.
const hashFromDb = "aslkdfjlkasdjflkajsudflkj";
bcrypt.compare(myPlaintextPassword, hashFromDb, function (err, result) {
  // result == true
});
bcrypt.compare(someOtherPlaintextPassword, hashFromDb, function (err, result) {
  // result == false
});
