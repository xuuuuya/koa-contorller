import 'reflect-metadata';
import Koa from 'koa';
import { registerControllers } from './router';
import { paramsControlType } from './types';
import Router, { RouterInstance } from '@koa/router';

export class KoaContainerApp extends Koa {
    private router: RouterInstance;

    constructor() {
        super();
        this.router = new Router();
    }

    getRouter = ()=>{
        return this.router;
    }

    registerControllers = (controlType: paramsControlType): this => {
        this.router = controlType.router || this.router
        const control = {
            router: this.router,
            controllers: controlType.controllers
        };
        registerControllers(this, control);
        return this;
    };
}
