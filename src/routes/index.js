var API_KEY = 1234;

var express = require('express');
var router = express.Router();
const {poolPromised,mssql} = require('../models/db');

//Test de pruba//
router.get('/', (req,res) => {
   res.end('API RUNNING')
}); 

//Obtener todos los Ingresos por mes
router.get('/ingresos', async(req,res) =>{
    console.log(req.query);
    if(req.query.key != API_KEY){
        res.end(JSON.stringify({success:false, message: 'Introduzca la API_KEY'}))
    }else{
        var mes = req.query.mes
        try{        
            const pool = await poolPromised
            const queryResult = await pool.request().input('fecha',mssql.NVarChar,mes)
            .query(`SELECT i.IdIngreso, (p.Nombre+' '+p.Apellido) as Persona ,i.fecha, i.cantidad, i.Descripcion FROM [ingreso] i LEFT JOIN [persona] p on i.IdPersona = p.IdPersona WHERE MONTH(i.fecha) = @fecha order by i.fecha desc`)

            if(queryResult.recordset.length > 0){
                res.end(JSON.stringify({success:true, result: queryResult.recordset }))
            }
            else{
                res.end(JSON.stringify({success:false, message: 'No tiene informacion' }))
            }
        }catch(err){
          res.status(500);//Error Interno del servidor
          res.send(JSON.stringify({success:false, message: err.message }));
        }
    }
});

//Obtener los ingresos de cada persona por mes
router.get('/IngresosPersonas', async(req, res) => {
 console.log(req.query)
 if(req.query.key != API_KEY){
    res.end(JSON.stringify({success:false, message: 'Introduzca la API_KEY'}))
 }else{
    var mes = req.query.mes
    try {
            const pool = await poolPromised
            const queryResult = await pool.request().input('fecha',mssql.NVarChar,mes)
            .query(`SELECT (p.Nombre+' '+p.Apellido) as Persona ,i.fecha, sum(i.cantidad) as Cantidad FROM [ingreso] i INNER JOIN [persona] p on i.IdPersona = p.IdPersona WHERE MONTH(i.fecha) = @fecha group by (p.Nombre+' '+p.Apellido),i.fecha`)

            if(queryResult.recordset.length > 0){
                res.end(JSON.stringify({success:true, result: queryResult.recordset }))
            }
            else{
                res.end(JSON.stringify({success:false, message: 'No tiene informacion' }))
            }

    } catch (err) {
        res.status(500);//Error Interno del servidor
        res.send(JSON.stringify({success:false, message: err.message }));
    }
 }
});

//Agregar y editar los ingresos

router.post('/ingresos', async(req, res) => {
  console.log(req.body);
  if(req.body.key != API_KEY){
    res.end(JSON.stringify({success:false, message: 'Introduzca la API_KEY'}))
  }
  else{
      var IdPersona = req.body.IdPersona;
      var fecha = req.body.fecha;
      var cantidad = req.body.cantidad;
      var Descripcion = req.body.Descripcion;
      var IdIngreso = req.body.IdIngreso;
      try {
        const pool = await poolPromised
        const queryResult = await pool.request()
        .input('IdPersona',mssql.Int,IdPersona)
        .input('fecha', mssql.Date, fecha )
        .input('cantidad', mssql.Decimal, cantidad)
        .input('Descripcion', mssql.NVarChar, Descripcion)
        .input('IdIngreso', mssql.Int, IdIngreso)
        .query(`IF EXISTS(SELECT * FROM [ingreso] where IdIngreso=@IdIngreso)`
                 + ` UPDATE [ingreso] set IdPersona = @IdPersona, fecha=@fecha, cantidad=@cantidad, Descripcion=@Descripcion where IdIngreso = @IdIngreso`
                 + ` ELSE`
                 + ` INSERT INTO [ingreso](IdPersona,fecha,cantidad,Descripcion)`
                 + ` VALUES(@IdPersona,@fecha,@cantidad,@Descripcion)`)
        console.log(queryResult);
        if(queryResult.rowsAffected != null){
            res.send(JSON.stringify({ success: true, message: "Success" }));
        }
        else{
            res.send(JSON.stringify({ success: false, message: "No se pudo agregar el registro" }));
        }

} catch (err) {
    res.status(500);//Error Interno del servidor
    res.send(JSON.stringify({success:false, message: err.message }));
}

  }

});

router.delete('/ingresos', async(req, res) => {
    console.log(req.query);
    if(req.query.key != API_KEY){
      res.end(JSON.stringify({success:false, message: 'Introduzca la API_KEY'}))
    }
    else{
        var IdIngreso = req.query.IdIngreso;
        try {
          const pool = await poolPromised
          const queryResult = await pool.request()
          .input('IdIngreso',mssql.Int,IdIngreso)
          .query('DELETE FROM [ingreso] where IdIngreso=@IdIngreso');
          console.log(queryResult);
          res.send(JSON.stringify({ success: true, message: "Success" }));
  
            } catch (err) {
                 res.status(500);//Error Interno del servidor
                 res.send(JSON.stringify({success:false, message: err.message }));
            }
  
    }
  
  });

//Agregar y obtener Usuario////////////////////////////////77
router.get('/persona', async(req, res) => {
    console.log(req.query)
    if(req.query.key != API_KEY){
       res.end(JSON.stringify({success:false, message: 'Introduzca la API_KEY'}))
    }else{
       var IdPersona = req.query.IdPersona
       try {
               const pool = await poolPromised
               const queryResult = await pool.request().input('IdPersona',mssql.Int,IdPersona)
               .query(`SELECT IdPersona,Nombre, Apellido,Rut FROM [persona]  WHERE IdPersona = @IdPersona`)
   
               if(queryResult.recordset.length > 0){
                   res.end(JSON.stringify({success:true, result: queryResult.recordset }))
               }
               else{
                   res.end(JSON.stringify({success:false, message: 'No tiene informacion' }))
               }
   
       } catch (err) {
           res.status(500);//Error Interno del servidor
           res.send(JSON.stringify({success:false, message: err.message }));
       }
    }
   });

   router.post('/persona', async(req, res) => {
    console.log(req.body);
    if(req.body.key != API_KEY){
      res.end(JSON.stringify({success:false, message: 'Introduzca la API_KEY'}))
    }
    else{
        var IdPersona = req.body.IdPersona;
        var Nombre = req.body.Nombre;
        var Apellido = req.body.Apellido;
        var Rut = req.body.Rut;
        try {
          const pool = await poolPromised
          const queryResult = await pool.request()
          .input('IdPersona',mssql.Int,IdPersona)
          .input('Nombre', mssql.NVarChar, Nombre )
          .input('Apellido', mssql.NVarChar, Apellido)
          .input('Rut', mssql.NVarChar, Rut)
          .query(`IF EXISTS(SELECT * FROM [persona] where IdPersona=@IdPersona)`
                   + ` UPDATE [persona] set  Nombre=@Nombre, Apellido=@Apellido, Rut=@Rut where IdPersona = @IdPersona`
                   + ` ELSE`
                   + ` INSERT INTO [persona](Nombre,Apellido,Rut)`
                   + ` VALUES(@Nombre,@Apellido,@Rut)`)
          console.log(queryResult);
          if(queryResult.rowsAffected != null){
              res.send(JSON.stringify({ success: true, message: "Success" }));
          }
          else{
              res.send(JSON.stringify({ success: false, message: "No se pudo agregar el registro" }));
          }
  
  } catch (err) {
      res.status(500);//Error Interno del servidor
      res.send(JSON.stringify({success:false, message: err.message }));
  }
  
    }
  
  });
///////////////////////////////////////////////////777

//Agregar, Obtener y actualizar los tipos de gastos
router.get('/tipogasto', async(req, res) => {
    console.log(req.query)
    if(req.query.key != API_KEY){
       res.end(JSON.stringify({success:false, message: 'Introduzca la API_KEY'}))
    }else{
       var IdPersona = req.query.IdPersona
       try {
               const pool = await poolPromised
               const queryResult = await pool.request()
               .query(`SELECT IdTipoGasto, Denominacion FROM [tipo_gasto]`)
   
               if(queryResult.recordset.length > 0){
                   res.end(JSON.stringify({success:true, result: queryResult.recordset }))
               }
               else{
                   res.end(JSON.stringify({success:false, message: 'No tiene informacion' }))
               }
   
       } catch (err) {
           res.status(500);//Error Interno del servidor
           res.send(JSON.stringify({success:false, message: err.message }));
       }
    }
   });

   router.post('/tipogasto', async(req, res) => {
    console.log(req.body);
    if(req.body.key != API_KEY){
      res.end(JSON.stringify({success:false, message: 'Introduzca la API_KEY'}))
    }
    else{
        var IdTipoGasto = req.body.IdTipoGasto;
        var Denominacion = req.body.Denominacion;
        try {
          const pool = await poolPromised
          const queryResult = await pool.request()
          .input('IdTipoGasto',mssql.Int,IdTipoGasto)
          .input('Denominacion', mssql.NVarChar, Denominacion )
          .query(`IF EXISTS(SELECT * FROM [tipo_gasto] where IdTipoGasto=@IdTipoGasto)`
                   + ` UPDATE [tipo_gasto] set  Denominacion = @Denominacion where IdTipoGasto = @IdTipoGasto`
                   + ` ELSE`
                   + ` INSERT INTO [tipo_gasto](Denominacion)`
                   + ` VALUES(@Denominacion)`)
          console.log(queryResult);
          if(queryResult.rowsAffected != null){
              res.send(JSON.stringify({ success: true, message: "Success" }));
          }
          else{
              res.send(JSON.stringify({ success: false, message: "No se pudo agregar el registro" }));
          }
  
  } catch (err) {
      res.status(500);//Error Interno del servidor
      res.send(JSON.stringify({success:false, message: err.message }));
  }
  
    }
  
  });


//Agregar, Obtener y actualizar los gastos
router.get('/gastos', async(req,res) =>{
    console.log(req.query);
    if(req.query.key != API_KEY){
        res.end(JSON.stringify({success:false, message: 'Introduzca la API_KEY'}))
    }else{
        var mes = req.query.mes
        try{        
            const pool = await poolPromised
            const queryResult = await pool.request().input('fecha',mssql.NVarChar,mes)
            .query(`SELECT g.IdGastos,tg.Denominacion as TipoGasto,g.fecha, g.Cantidad, g.Descripcion FROM [gasto] g LEFT JOIN [tipo_gasto] tg on g.IdTipoGasto = tg.IdTipoGasto WHERE MONTH(g.fecha) = @fecha order by g.fecha desc`)

            if(queryResult.recordset.length > 0){
                res.end(JSON.stringify({success:true, result: queryResult.recordset }))
            }
            else{
                res.end(JSON.stringify({success:false, message: 'No tiene informacion' }))
            }
        }catch(err){
          res.status(500);//Error Interno del servidor
          res.send(JSON.stringify({success:false, message: err.message }));
        }
    }
});

router.post('/gastos', async(req, res) => {
    console.log(req.body);
    if(req.body.key != API_KEY){
      res.end(JSON.stringify({success:false, message: 'Introduzca la API_KEY'}))
    }
    else{
        var IdGastos = req.body.IdGastos;
        var IdTipoGasto = req.body.IdTipoGasto;
        var fecha = req.body.fecha;
        var Cantidad = req.body.Cantidad;
        var Descripcion = req.body.Descripcion;
        try {
          const pool = await poolPromised
          const queryResult = await pool.request()
          .input('IdGastos',mssql.Int,IdGastos)
          .input('fecha', mssql.Date, fecha )
          .input('Cantidad', mssql.Decimal, Cantidad)
          .input('Descripcion', mssql.NVarChar, Descripcion)
          .input('IdTipoGasto', mssql.Int, IdTipoGasto)
          .query(`IF EXISTS(SELECT * FROM [gasto] where IdGastos=@IdGastos)`
                   + ` UPDATE [gasto] set IdTipoGasto = @IdTipoGasto, fecha=@fecha, Cantidad=@Cantidad, Descripcion=@Descripcion where IdGastos = @IdGastos`
                   + ` ELSE`
                   + ` INSERT INTO [gasto](IdTipoGasto,fecha,cantidad,Descripcion)`
                   + ` VALUES(@IdTipoGasto,@fecha,@cantidad,@Descripcion)`)
          console.log(queryResult);
          if(queryResult.rowsAffected != null){
              res.send(JSON.stringify({ success: true, message: "Success" }));
          }
          else{
              res.send(JSON.stringify({ success: false, message: "No se pudo agregar el registro" }));
          }
  
  } catch (err) {
      res.status(500);//Error Interno del servidor
      res.send(JSON.stringify({success:false, message: err.message }));
  }
  
    }
  
  });

  router.delete('/gastos', async(req, res) => {
    console.log(req.query);
    if(req.query.key != API_KEY){
      res.end(JSON.stringify({success:false, message: 'Introduzca la API_KEY'}))
    }
    else{
        var IdGastos = req.query.IdGastos;
        try {
          const pool = await poolPromised
          const queryResult = await pool.request()
          .input('IdGastos',mssql.Int,IdGastos)
          .query('DELETE FROM [gasto] where IdGastos=@IdGastos');
          console.log(queryResult);
          res.send(JSON.stringify({ success: true, message: "Success" }));
  
            } catch (err) {
                 res.status(500);//Error Interno del servidor
                 res.send(JSON.stringify({success:false, message: err.message }));
            }
  
    }
  
  });

module.exports = router;