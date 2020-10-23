const layout = require("../layout");

module.exports = ({ req }) => {
  return layout({
    content: `<div>
    Your user id is: ${req.session.userId}
        <form method="POST">
            <input placeholder="email" name= "email" /> 
            <input placeholder="password" name= "password" /> 
            <input placeholder="password confirmation" name= "passwordConfirmation" />
            <button> Sign up </button>
        </form>
    </div>`,
  });
};
