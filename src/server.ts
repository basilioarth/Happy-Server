import express from 'express';
import path from 'path';
import cors from 'cors';

import './database/connection';
import 'express-async-errors';

import routes from './routes';
import errorHandler from './errors/handler'; 

const app = express();

app.use(cors());
// permite que a nossa aplicação seja acessível de diferentes domínios. 
// Por padrão o node vem com uma proteção que faz com que outras aplicações 
// front-end não possam fazer requisições se não estiverem no mesmo endereço 
// da nossa API/no mesmo domínio do server. Assim sendo, com o cors o nosso 
// front-end executando na porta 3000 pode fazer requisições ao back-end executando 
// na porta 3333.
app.use(express.json());
app.use(routes);
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
// funcionalidade que nos possibilita visualizar as imagens através da url.
app.use(errorHandler);
// lidando com exceções

app.listen(3333);