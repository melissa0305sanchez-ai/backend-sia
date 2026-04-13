const authService = require("../services/auth.service")

const login = async (req,res) => {
    const {document,password} = req.body
    
    const result = await authService.login(document, password);

    res.status(result.code).json(result)
}

const addUser = async (req,res) => {
    const {name, lastname, document, password, role} = req.body
    
    const result = await authService.addUser(name, lastname, document, password, role);

    res.status(result.code).json(result)
}

const setupAdmin = async (req, res) => {
    const { name, lastname, document, password } = req.body

    const result = await authService.setupAdmin(name, lastname, document, password);

    res.status(result.code).json(result)
}


module.exports = {
    login,
    addUser,
    setupAdmin
}