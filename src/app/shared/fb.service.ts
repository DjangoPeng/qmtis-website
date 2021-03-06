import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import { Observable } from 'rxjs/Observable';

import { environment } from '../../environments/environment';

// qmtis?fields=engagement,fan_count,app_links,mission,events.limit(99999){attending_count} - get eventcount and fan count

const PHOTOS_URL = 'https://graph.facebook.com/v2.8/qmtis/photos';
const EVENTS_URL = 'https://graph.facebook.com/v2.8/qmtis/events';
// tslint:disable-next-line:max-line-length
const OAUTH_URL = `https://graph.facebook.com/oauth/access_token?client_id=${environment.facebook.clientId}&client_secret=${environment.facebook.clientSecret}&grant_type=client_credentials`;

interface FaceboothOAuthResponse {
    access_token: string;
    token_type: string;
}

@Injectable()
export class FacebookService {
    private authTokenObservable: Observable<FaceboothOAuthResponse>;

    constructor(private http: Http) {

    }

    public getPhotos(): Observable<FacebookPhotosResponse> {
        return this.getAuthToken().flatMap((authToken) => {
            return this.http.get(`${PHOTOS_URL}?access_token=${authToken.access_token}&type=uploaded&limit=9`).map((photoJson) => {
                return photoJson.json() as FacebookPhotosResponse;
            }).catch(this.handleError);
        }).catch(this.handleError);
    }

    public getEvents(): Observable<FacebookEventResponse> {
        return this.getAuthToken().flatMap((authToken) => {
            return this.http.get(`${EVENTS_URL}?access_token=${authToken.access_token}&limit=4`).map((eventJson) => {
                return eventJson.json() as FacebookEventResponse;
            }).catch(this.handleError);
        }).catch(this.handleError);
    }

    private getAuthToken(): Observable<FaceboothOAuthResponse> {
        if (this.authTokenObservable) {
            return this.authTokenObservable;
        }

        this.authTokenObservable = this.http.get(OAUTH_URL)
            .map((response) => response.json() as FaceboothOAuthResponse)
            .catch(this.handleError);
        return this.authTokenObservable;
    }

    private handleError(error: any): Observable<any> {
        const errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg);
        return Observable.throw(errMsg);
    }
}
