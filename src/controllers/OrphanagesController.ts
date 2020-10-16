import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import orphanageView from '../views/orphanages_view';
import * as Yup from 'yup';

import Orphanage from '../models/Orphanage';

export default {
    async index(request: Request, response: Response){
        const orphanagesRepository = getRepository(Orphanage);

        const orphanages = await orphanagesRepository.find({
            relations: ['images']
        });

        return response.json(orphanageView.renderMany(orphanages));
    },

    async show(request: Request, response: Response){
        const { id } = request.params;

        const orphanagesRepository = getRepository(Orphanage);

        const orphanage = await orphanagesRepository.findOneOrFail(id, {
            relations: ['images']
        });

        return response.json(orphanageView.render(orphanage));
    },

    async create(request: Request, response: Response) {

        const {
            name,
            latitude,
            longitude,
            about,
            instructions,
            opening_hours,
            open_on_weekends,
        } = request.body;
    
        const orphanagesRepository = getRepository(Orphanage);
        
        const requestImages = request.files as Express.Multer.File[];
        // operação necessária para lidarmos com o upload de múltiplos arquivos (: as Express.Multer.File[])

        const images = requestImages.map(image => {
            return { path: image.filename }
        })

        // processo de validação dos dados...
        const data = {
            name,
            latitude,
            longitude,
            about,
            instructions,
            opening_hours,
            open_on_weekends: open_on_weekends === 'true',
            images
        }

        const schema = Yup.object().shape({
            name: Yup.string().required(),
            latitude: Yup.number().required(),
            longitude: Yup.number().required(),
            about: Yup.string().required().max(300),
            instructions: Yup.string().required(),
            opening_hours: Yup.string().required(),
            open_on_weekends: Yup.boolean().required(),
            images: Yup.array(
                Yup.object().shape({
                    path: Yup.string().required()
                })
            )
        });

        const finalData = schema.cast(data);

        await schema.validate(data, {
            abortEarly: false,
            // se existir uma série de campos com erro, queremos que ele retorne todos os erros,
            // e não só o primeiro que ele encontrar.
        });
        //... processo de validação dos dados.

        const orphanage = orphanagesRepository.create(data);
        // Deixa o orfanato pré-criado
    
        await orphanagesRepository.save(orphanage);
        // Salva o orfonato no banco de dados
    
        return response.status(201).json(orphanage);
        // O código/status 201 informa que algo foi criado com sucesso
    }
};