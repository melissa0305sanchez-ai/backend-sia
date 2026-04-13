const { EntitySchema } = require("typeorm");

const User = new EntitySchema({
    name: "User",
    tableName: "users",
    columns: {
        id: {
            primary: true,
            type: 'int',
            generated: true
        },
        name: {
            type: 'varchar',
            length: 250,
            nullable:false
        },
        lastname:  {
            type: 'varchar',
            length: 250,
            nullable:false
        },
        document: {
            type: 'bigint',
            require: true,
            unique: true
        },
        password: {
            type: 'varchar',
            nullable:false
        },      
        role: {
            type: 'varchar',
            length: 20,
            nullable: false,
            default: 'ESTUDIANTE'
        },
    }
})

module.exports = User;