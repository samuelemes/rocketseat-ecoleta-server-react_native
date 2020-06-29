import Knex from '../database/connection';
import {Request, Response } from 'express'

class ItemsController {
    async index (request: Request, response: Response) {
        const items = await Knex('items').select('*');
        const serializeItems = items.map(item => {
            return {
                id: item.id,
                name: item.title,
                image_url: `http://192.168.0.112:3333/uploads/${item.image}`,
            };
        });
    
        return response.json(serializeItems);
    }

    async create(request: Request, response: Response) {

        try {
            // await Knex('items').where('id','>', 7).del();
            // return response.json();
            const {
                image, title
            } = request.body;

            const item = {
                image: image ? image : 'image-fake',
                title,
            };

            await Knex('items').insert(item);
            console.log('item',item);
            
            return response.json({
                ...item,
            });
            
        } catch (error) {
            
        }
    }
}

export default ItemsController