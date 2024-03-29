import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { map, delay, switchMap, tap } from 'rxjs/operators';
import { IonicCachingService } from './ionic_caching.service';
import { ToastController } from '@ionic/angular';
import { Network } from '@capacitor/network';
import { HttpsService } from './https.service';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    connected = true;

    constructor(
        public https: HttpsService,
        public cachingService: IonicCachingService,
        private toastController: ToastController
    ) {
        Network.addListener('networkStatusChange', async status => {
            this.connected = status.connected;
        });

        // Can be removed once #17450 is resolved: https://github.com/ionic-team/ionic/issues/17450
        this.toastController.create({ animated: false }).then(t => { t.present(); t.dismiss(); });
    }

    /*
    // Standard API Functions
    getUsers(forceRefresh: boolean) {
        const url = 'https://randomuser.me/api?results=10';
        return this._getData(url, forceRefresh).pipe(
            map(res => res['results'])
        );
    }

    getChuckJoke(forceRefresh: boolean) {
        const url = 'https://api.chucknorris.io/jokes/random';
        return this._getData(url, forceRefresh);
    }
    */

    // Caching Functions
    public getData(url, forceRefresh = false, headers = {}, params = {}, cacheTime?: number): Observable<any> {

        // Handle offline case
        if (!this.connected) {
            this.toastController.create({
                message: 'Stai visualizzando i dati offline.',
                duration: 2000
            }).then(toast => {
                toast.present();
            });
            return from(this.cachingService.getCachedRequest(url));
        }

        // Handle connected case
        if (forceRefresh) {
            // Make a new API call
            return this.callAndCache(url, headers, params, cacheTime);
        } else {
            // Check if we have cached data
            const storedValue = from(this.cachingService.getCachedRequest(url));
            return storedValue.pipe(
                switchMap(result => {
                    if (!result) {
                        // Perform a new request since we have no data
                        return this.callAndCache(url, headers, params, cacheTime);
                    } else {
                        // Return cached data
                        return of(result);
                    }
                })
            );
        }
    }

    private callAndCache(url, headers = {}, params = {}, cacheTime?: number): Observable<any> {
        return this.https.get(url, headers, params).pipe(
            //delay(2000), // solo per testing!
            tap(res => {
                // Store our new data
                this.cachingService.cacheRequest(url, res, cacheTime);
            })
        )
    }
}