const { EntitySchema } = require("typeorm");

const Subject = new EntitySchema({
  name: "Subject",
  tableName: "subjects",
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
    group: {
      type: "many-to-one",
      target: "Group",
      joinColumn: true,
      nullable: false,
      onDelete: "CASCADE",
    },
    teacher: {
      type: "many-to-one",
      target: "User",
      joinColumn: true,
      nullable: false,
      onDelete: "RESTRICT",
    },
  },
});

module.exports = Subject;
