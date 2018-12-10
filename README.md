Entredevs
---------

> Código de exemplo utilizado na talk sobre teste unitário com o pessoal do PagSeguro

Executando os testes
====================

```
git clone https://github.com/josielrocha/entredevs-code.git
cd entredevs-code
npm i
npm test
```

Visualizando o código no browser
================================

### Usando Python 2
```
cd entredevs-code
python -m http.server 9000
```

### Usando Python 3
```
cd entredevs-code
python -m SimpleHTTPServer 9000
```

### Usando PHP 5.4 +
```
cd entredevs-code
php -S localhost:9000
```

Visite a url `http://localhost:9000`
