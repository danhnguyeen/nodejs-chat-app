class Users {
  constructor() {
    this.users = []
  }
  addUser(id, name, room) {
    var user = {id, name, room};
    this.users.push(user);
    return this.users;
  }
  removeUser(id) {
    const user = this.users.find(user => user.id === id);
    if(user) {
      this.users = this.users.filter(user => user.id !== id);
    }
    return user;
  }
  getUser(id) {
    return this.users.find(user => user.id === id);
  }
  getUserList(room) {
    return this.users.filter(user => user.room === room);
  }
}

module.exports = Users;
