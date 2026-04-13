const { EntitySchema } = require("typeorm");

const Group = new EntitySchema({
  name: "Group",
  tableName: "groups",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    name: {
      type: "varchar",
      length: 200,
      nullable: false,
    },
  },
  relations: {
    teacher: {
      type: "many-to-one",
      target: "User",
      joinColumn: true,
      nullable: false,
      onDelete: "RESTRICT",
    },
    students: {
      type: "one-to-many",
      target: "GroupStudent",
      inverseSide: "group",
      cascade: true,
    },
  },
});

module.exports = Group;
