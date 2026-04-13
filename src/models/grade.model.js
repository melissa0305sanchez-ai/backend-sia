const { EntitySchema } = require("typeorm");

const Grade = new EntitySchema({
  name: "Grade",
  tableName: "grades",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    value: {
      type: "float",
      nullable: false,
    },
    createdAt: {
      type: "datetime",
      createDate: true,
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
    subject: {
      type: "many-to-one",
      target: "Subject",
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
    teacher: {
      type: "many-to-one",
      target: "User",
      joinColumn: true,
      nullable: false,
      onDelete: "RESTRICT",
    },
  },
});

module.exports = Grade;
