const fs = require("fs");
const crypto = require("crypto");
const util = require("util");
const scrypt = util.promisify(crypto.scrypt); //promise version of crypto.scrypt

class UsersRepository {
  //check if there is a file to store the info
  constructor(filename) {
    if (!filename) {
      throw new Error("Creating a repository requires a new filename");
    }
    this.filename = filename;
    //chek if the file exixts
    try {
      fs.accessSync(this.filename);
      //if not create a new file
    } catch (err) {
      fs.writeFileSync(this.filename, "[]");
    }
  }
  async getAll() {
    //open the file called this.filename, read its contents, parse the contents, return the parsed data
    return JSON.parse(
      await fs.promises.readFile(this.filename, { encoding: "utf8" })
    );
  }

  async create(attrs) {
    attrs.id = this.randomId();
    const salt = crypto.randomBytes(8).toString("hex");
    const buf = await scrypt(attrs.password, salt, 64);
    //load up the content of the users.file
    const records = await this.getAll();
    //push in the new user
    const record = {
      ...attrs,
      password: `${buf.toString("hex")}.${salt}`,
    };
    records.push(record);
    await this.writeAll(records);
    return record;
  }

  async comparePasswords(saved, supplied) {
    //saved is the password in the db --> 'hashed.salt'
    //supplied is the password that the user enters
    const [hashed, salt] = saved.split(".");
    const hashedSuppliedBuf = await scrypt(supplied, salt, 64);
    return hashed === hashedSuppliedBuf.toString("hex");
  }

  async writeAll(records) {
    //write the updated records array back to users.json after turning into a json string
    await fs.promises.writeFile(
      this.filename,
      JSON.stringify(records, null, 2)
    ); //2nd argument = costumer formatter, 3rd argument: level of indentation;
  }

  randomId() {
    return crypto.randomBytes(4).toString("hex");
  }

  async getOne(id) {
    const records = await this.getAll();
    return records.find((record) => record.id === id);
  }

  async delete(id) {
    const records = await this.getAll();
    const filteredRecords = records.filter((record) => record.id !== id);
    await this.writeAll(filteredRecords);
  }

  async update(id, attrs) {
    const records = await this.getAll();
    const record = records.find((record) => record.id === id);
    if (!record) {
      throw new Error(`Record with id of ${id} not found`);
    }
    Object.assign(record, attrs);
    await this.writeAll(records);
  }

  async getOneBy(filters) {
    //get all the records in the json file
    const records = await this.getAll();
    for (let record of records) {
      //initiliaze a found variable to true
      let found = true;
      //loop through all the key value pairs in the filters object
      for (let key in filters) {
        //if the record at the same key is different to the property of the filter
        if (record[key] !== filters[key]) {
          //then flip the found variable to false --> meaning it has not been found
          found = false;
        }
      }
      //if the record has beeen found --> therefore the found variable is still true, then return the entire record object
      if (found) {
        return record;
      }
    }
  }
}

module.exports = new UsersRepository("users.json");
