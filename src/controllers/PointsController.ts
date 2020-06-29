import {Request, Response } from 'express'
import Knex from "../database/connection";

class PointsControllers {
    async show(request: Request, response: Response) {
        const { id } = request.params;

        const point = await Knex('points').where('id', id).first();
        if (!point) {
            return response.status(400).json({ message: 'Point not found.' });
        }
        
        const items = await Knex('items')
        .join('point_items', 'items.id', '=', 'point_items.item_id')
        .where('point_items.point_id', id)
        .select('items.title');
        
        return response.json({ point, items});
    }

    async create(request: Request, response: Response) {

        try {
            const {
                image, name, email, whatsapp, latitude, longitude, city, uf, items
            } = request.body;

            const trx = await Knex.transaction();
    
            const item = {
                image: image ? image : 'https://images.unsplash.com/photo-1556767576-5ec41e3239ea?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60',
                name,
                email,
                whatsapp,
                latitude,
                longitude,
                city,
                uf
            };
            const insertedIds = await trx('points').insert(item);

            const point_id = insertedIds[0];
            const pointItems = items.map((item_id: number) =>
            {
                return {
                    point_id,
                    item_id
                };
            });
            
            await trx('point_items').insert(pointItems);
            await trx.commit();
            
            return response.json({
                id: point_id,
                ...item,

            });
            
        } catch (error) {
            
        }
    }

    async index(request: Request, response: Response) {
        const { city, uf, items} = request.query; 
        const parsedItems = String(items)
        .split(',')
        .map(item => Number(item.trim()));

        
        const points = await Knex('points')
        .join('point_items', 'points.id', '=', 'point_items.point_id')
        .whereIn('point_items.item_id', parsedItems)
        .andWhere('points.city', String(city))
        .andWhere('points.uf', String(uf))
        .distinct()
        .select('points.*');
        
        return response.json(points);
    }
}

export default PointsControllers;