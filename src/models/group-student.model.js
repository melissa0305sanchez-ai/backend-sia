const { EntitySchema } = require("typeorm");

const GroupStudent = new EntitySchema({
  name: "GroupStudent",
  tableName: "group_students",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
  },
  relations: {
    group: {
      type: "many-to-one",
      target: "Group",
      joinColumn: true,
      nullable: false,
      onDelete: "CASCADE",
    },
    student: {
      type: "many-to-one",
      target: "User",
      joinColumn: true,
      nullable: false,
      onDelete: "CASCADE",
    },
  },
});

module.exports = GroupStudent;
