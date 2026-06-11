const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

// ================= CONEXIÓN =================
mongoose.connect("mongodb://goparcesas:Bogota2026@ac-27bri72-shard-00-00.5khlnyw.mongodb.net:27017,ac-27bri72-shard-00-01.5khlnyw.mongodb.net:27017,ac-27bri72-shard-00-02.5khlnyw.mongodb.net:27017/goparce?ssl=true&replicaSet=atlas-3cxkbb-shard-0&authSource=admin&appName=Cluster0")
.then(() => console.log("🔥 Conectado a MongoDB"))
.catch(err => console.log("❌ Error MongoDB:", err));

// ================= GENERADOR CODIGO =================
function generarCodigo(prefijo) {
const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
let random = "";
for (let i = 0; i < 6; i++) {
random += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
}
return `${prefijo}-${random}`;
}

// ================= MODELOS =================

// USUARIO
const Usuario = mongoose.model("Usuario", new mongoose.Schema({
tipo: String,
nombre: String,
apellido: String,
cedula: String,
entidad: String,
celular: String,
correo: String,
password: String,
codigo: String,
intereses: [String],
facebook: String,
instagram: String,
tiktok: String,
cambiosCelular: { type: Number, default: 0 },
fecha_creacion: { type: Date, default: Date.now }
}));

// CATEGORIAS
const Categoria = mongoose.model("Categoria", new mongoose.Schema({
_id: String,
nombre: String,
icono: String,
estado: String,
subcategorias: [String]
}));

// EVENTO
const Evento = mongoose.model("Evento", new mongoose.Schema({
titulo: String,
descripcion: String,
fecha: String,
fechaFin: String,
hora: String,
direccion: String,
lat: Number,
lng: Number,
usuario_id: String,
codigo: String,
etiquetas: [String],
interesados: { type: Number, default: 0 },
notificaciones: { type: Number, default: 0 },
destacado: { type: Boolean, default: false },
estado: { type: String, default: "activo" },
fecha_creacion: { type: Date, default: Date.now }
}));

// MURO
const Muro = mongoose.model("Muro", new mongoose.Schema({
titulo: String,
descripcion: String,
lat: Number,
lng: Number,
usuario_id: String,
codigo: String,
fecha_creacion: { type: Date, default: Date.now }
}));

// SERVICIO
const Servicio = mongoose.model("Servicio", new mongoose.Schema({
titulo: String,
descripcion: String,
etiquetas: [String],
dias: [String],
costo: String,
cupos: String,
link: String,
interesados: { type: Number, default: 0 },
fecha_publicacion: Date,
usuario_id: String,
codigo: String,
fecha_creacion: { type: Date, default: Date.now }
}));

// NOTICIA
const Noticia = mongoose.model("Noticia", new mongoose.Schema({
titulo: String,
descripcion: String,
tipo: String,
link: String,
interesados: { type: Number, default: 0 },
fecha_publicacion: Date,
usuario_id: String,
codigo: String,
fecha_creacion: { type: Date, default: Date.now }
}));

// CUPON
const Cupon = mongoose.model("Cupon", new mongoose.Schema({
nombre: String,
descripcion: String,
tipoPromo: String,
valorPromo: String,
codigo: String,
fechaInicio: String,
fechaFin: String,
uso: String,
maxUso: Number,
cantidad: String,
adquiridos: { type: Number, default: 0 },
fecha_publicacion: Date,
usuario_id: String,
fecha_creacion: { type: Date, default: Date.now }
}));

// ================= CATEGORIAS =================
app.get("/categorias", async (req, res) => {
try {
const categorias = await Categoria.find({ estado: "activo" });
console.log("📦 CATEGORIAS ENVIADAS:", categorias);
res.json(categorias);
} catch (error) {
console.log("❌ ERROR /categorias:", error);
res.status(500).json({ error: "Error obteniendo categorías" });
}
});

// ================= USUARIOS =================
app.get("/usuarios", async (req, res) => {
res.json(await Usuario.find());
});

// EDITAR PERFIL
app.put("/usuarios/:id", async (req, res) => {
try {
const user = await Usuario.findById(req.params.id);


if (!user) {
  return res.status(404).json({ error: "Usuario no encontrado" });
}

if (req.body.celular && req.body.celular !== user.celular) {
  if (user.cambiosCelular >= 2) {
    return res.status(400).json({ error: "Ya no puedes cambiar el número" });
  }
  user.cambiosCelular += 1;
}

Object.assign(user, req.body);
await user.save();

res.json(user);


} catch (err) {
console.log("❌ ERROR UPDATE:", err);
res.status(500).json({ error: "Error actualizando usuario" });
}
});

// REGISTRO
app.post("/registro", async (req, res) => {
try {


const { nombre, apellido, cedula, entidad, correo, celular, tipo, password } = req.body;

if (!nombre || !apellido || !cedula || !entidad || !correo || !celular || !tipo || !password) {
  return res.status(400).json({ error: "Completa todos los campos" });
}

if (await Usuario.findOne({ correo }))
  return res.status(400).json({ error: "Correo ya registrado" });

if (await Usuario.findOne({ celular }))
  return res.status(400).json({ error: "Celular ya registrado" });

const nuevo = new Usuario({
  ...req.body,
  codigo: generarCodigo(tipo === "negocio" ? "RN" : "RO"),
  fecha_creacion: new Date()
});

await nuevo.save();
res.json(nuevo);


} catch (err) {
console.log("❌ ERROR REGISTRO:", err);
res.status(500).json({ error: "Error guardando usuario" });
}
});

// LOGIN
app.post("/login", async (req, res) => {
try {


const user = await Usuario.findOne({
  correo: req.body.correo,
  password: req.body.password
});

if (!user)
  return res.status(401).json({ error: "Credenciales incorrectas" });

res.json(user);


} catch (err) {
console.log("❌ ERROR LOGIN:", err);
res.status(500).json({ error: "Error en login" });
}
});

// ================= EVENTOS =================
app.post("/eventos", async (req, res) => {
try {


const nuevo = new Evento({
  ...req.body,
  codigo: generarCodigo("ET"),
  fecha_creacion: new Date()
});

await nuevo.save();
res.json(nuevo);


} catch (err) {
console.log("❌ ERROR EVENTO:", err);
res.status(500).json({ error: "Error creando evento" });
}
});

app.get("/eventos", async (req, res) => {
res.json(await Evento.find({ estado: "activo" }));
});

// IMPULSAR
app.post("/impulsar/:id", async (req, res) => {
await Evento.findByIdAndUpdate(req.params.id, {
destacado: true,
$inc: { notificaciones: 10 }
});
res.json({ mensaje: "Impulsado" });
});

// ================= MURO =================
app.post("/muro", async (req, res) => {

let muro = await Muro.findOne({ usuario_id: req.body.usuario_id });

if (muro) {
muro.titulo = req.body.titulo;
muro.descripcion = req.body.descripcion;
muro.lat = req.body.lat;
muro.lng = req.body.lng;
await muro.save();
return res.json(muro);
}

const nuevo = new Muro({
...req.body,
codigo: generarCodigo("MR"),
fecha_creacion: new Date()
});

await nuevo.save();
res.json(nuevo);
});

app.get("/muro", async (req, res) => {
res.json(await Muro.find());
});

// ================= SERVICIOS =================
app.post("/servicios", async (req, res) => {
try {


const nuevo = new Servicio({
  ...req.body,
  codigo: generarCodigo("SR"),
  fecha_creacion: new Date()
});

await nuevo.save();
res.json(nuevo);


} catch (err) {
console.log("❌ ERROR SERVICIO:", err);
res.status(500).json({ error: "Error creando servicio" });
}
});

app.get("/servicios", async (req, res) => {
res.json(await Servicio.find());
});

// ================= NOTICIAS =================
app.post("/noticias", async (req, res) => {
try {


const nueva = new Noticia({
  ...req.body,
  codigo: generarCodigo("NT"),
  fecha_creacion: new Date()
});

await nueva.save();
res.json(nueva);


} catch (err) {
console.log("❌ ERROR NOTICIA:", err);
res.status(500).json({ error: "Error creando noticia" });
}
});

app.get("/noticias", async (req, res) => {
res.json(await Noticia.find());
});

// ================= CUPONES =================
app.post("/cupones", async (req, res) => {
try {


const nuevo = new Cupon({
  ...req.body,
  codigo: generarCodigo("CP"),
  fecha_creacion: new Date()
});

await nuevo.save();
res.json(nuevo);


} catch (err) {
console.log("❌ ERROR CUPON:", err);
res.status(500).json({ error: "Error creando cupón" });
}
});

app.get("/cupones", async (req, res) => {
res.json(await Cupon.find());
});

// ================= INTERES =================
app.post("/interesados", async (req, res) => {

const { usuario_id, evento_id } = req.body;

const usuario = await Usuario.findById(usuario_id);
if (!usuario) return res.status(404).json({ error: "Usuario no existe" });

if (usuario.intereses?.includes(evento_id))
return res.json({ mensaje: "Ya registrado" });

await Usuario.findByIdAndUpdate(usuario_id, {
$push: { intereses: evento_id }
});

await Evento.findByIdAndUpdate(evento_id, {
$inc: { interesados: 1 }
});

res.json({ mensaje: "Interés guardado" });
});

// ================= SERVER =================
app.listen(PORT, () => {
console.log("🚀 Servidor corriendo en http://localhost:" + PORT);
});
