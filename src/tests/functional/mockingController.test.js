import mongoose from "mongoose";
import chai from "chai";
import chaiHttp from "chai-http";
import app from "../../app.js";
import User from "../../models/User.js";

const { expect } = chai;
chai.use(chaiHttp);

describe("Pruebas del controlador de mockusers", () => {
  before(async () => {
    console.log("Cargando variables de entorno...");
    if (process.env.NODE_ENV !== "test") {
      console.error("El entorno no es de prueba. Abortando...");
      process.exit(1);
    }

    // Conexión a la base de datos de pruebas
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`Conectado a MongoDB en el entorno ${process.env.NODE_ENV}`);
  });

  after(async () => {
    // Limpiar la base de datos de pruebas después de las pruebas
    await mongoose.connection.dropDatabase();
    console.log("Base de datos de pruebas limpiada.");
    await mongoose.connection.close();
    console.log("Conexión cerrada con la base de datos de pruebas.");
  });

  beforeEach(async () => {
    // Eliminar todas las colecciones antes de cada prueba
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
    console.log("Colecciones limpiadas antes de la prueba.");
  });

  it("Debería generar usuarios con faker", (done) => {
    chai
      .request(app)
      .get("/api/mocks/mockingusers")
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("status", "success");
        expect(res.body).to.have.property("data").that.is.an("array");
        done();
      });
  });

  it("Debería generar usuarios con faker e insertarlos a la base de datos", async () => {
    const res = await chai.request(app).post("/api/mocks/generateData").send({
      users: 5,
      pets: 2,
    });

    expect(res).to.have.status(200);
    expect(res.body).to.have.property("status", "success");
    expect(res.body.message).to.include("Generated and inserted");

    const users = await User.find({});
    expect(users).to.have.length(5);
    console.log("Usuarios insertados en la base de datos:", users);
  });

  it("Debería generar un error si se presenta algún parámetro inválido", (done) => {
    chai
      .request(app)
      .post("/api/mocks/generateData")
      .send({
        users: -1,
        pets: 2,
      })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.have.property("status", "error");
        expect(res.body.message).to.equal("Invalid 'users' or 'pets' parameter");
        done();
      });
  });
});
