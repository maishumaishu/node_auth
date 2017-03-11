import * as settings from '../settings';
import { Controller } from '../common';
import { MongoClient, ObjectID } from 'mongodb';
import { DataContext } from '../database';

interface UrlRedirect {
    urlPattern: string,
    target: string,
    applicationId: ObjectID
}

const urlPatterns = 'UrlRedirect';
export default class urlRedirectController extends Controller {
    async list() {
        var dc = this.createDataContext();
        this.appId
        try {
            let table = await dc.table<UrlRedirect>(urlPatterns);
            let items = await table.find();
            return items;
        }
        finally {
            dc.close();
        }
    }
    async add(item: UrlRedirect) {
        var dc = this.createDataContext();
        try {
            let table = await dc.table<UrlRedirect>(urlPatterns);
            let items = await table.insertOne(item);
            return items;
        }
        finally {
            dc.close();
        }
    }
    async update(item: UrlRedirect) {
        var dc = this.createDataContext();
        try {

        }
        finally {
            dc.close();
        }
    }
    async delete(id: string) {
        var dc = this.createDataContext();
        try {
            let table = await dc.table<UrlRedirect>(urlPatterns);
            table.deleteOne({ _id: new ObjectID(id) });
        }
        finally {
            dc.close();
        }
    }

    private createDataContext() {
        return new DataContext(settings.conn.auth);
    }
}

