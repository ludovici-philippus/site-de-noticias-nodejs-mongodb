const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const path = require("path");

const app = express();

const Posts = require("./Posts");

mongoose.connect("mongodb+srv://root:senha@cluster0.lprul.mongodb.net/nome?retryWrites=true&w=majority",{useNewUrlParser: true, useUnifiedTopology: true}).then(function(){
	console.log("Conectado com sucesso!");
}).catch(function(err){
	console.log(err.message)
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");
app.use("/public", express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "/pages"));
/*^^^ BASE CODE ^^^*/

app.get("/", (req, res)=>{
	if(req.query.busca == null){
		Posts.find({}).sort({"_id": -1}).exec(function(err, posts){
			 
			posts = posts.map(function(val){
				return {
					titulo: val.titulo,
					conteudo: val.conteudo,
					descricaoCurta: val.conteudo.substr(0, 100),
					imagem: val.imagem,
					slug: val.slug,
					categoria: val.categoria,	
				}
			});

			Posts.find({}).sort({"views": -1}).limit(3).exec(function(err, postsTop){
				postsTop = postsTop.map(function(val){
					return{
						titulo: val.titulo,
						conteudo: val.conteudo,
						descricaoCurta: val.conteudo.substr(0, 100),
						imagem: val.imagem,
						slug: val.slug,
						categoria: val.categoria,
						views: val.views
					}
				});

				res.render("home", {posts: posts, posts_top: postsTop});	
			});			
		});
	}else{

		Posts.find({titulo: {$regex: req.query.busca, $options: 'i'}}, function(err, posts){
			res.render("busca", {posts:posts, contagem: posts.length});
		});
	}
});

app.get("/:slug", (req, res)=>{
	Posts.findOneAndUpdate({slug: req.params.slug}, {$inc: {views:1}}, {new: true}, function(err, resposta){
		Posts.find({}).sort({"views": -1}).limit(3).exec(function(err, postsTop){
			if(err) throw err.message;
			postsTop = postsTop.map(function(val){
				return {
					titulo: val.titulo,
					conteudo: val.conteudo,
					descricaoCurta: val.conteudo.substr(0, 100),
					slug: val.slug,
					imagem: val.imagem,
					views: val.views,
					categoria: val.categoria
				}
			});
			res.render("single", {noticia:resposta, postsTop: postsTop});
		})
	});
});


/*vvv SERVER vvv*/
app.listen(5000, ()=>{
	console.log("server iniciado");
});
