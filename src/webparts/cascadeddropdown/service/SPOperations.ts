import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
export interface ISPResponse {
  nextUrl: string;
  result: any;
  ok: boolean;
  error: string;
}
export class SPOperations {
    public getOperations(restQuery: string, spHttpClient: SPHttpClient): Promise<ISPResponse> {

        let custResonse: ISPResponse;
        return spHttpClient.get(restQuery, SPHttpClient.configurations.v1,
          {
            headers: {
              'Accept': 'application/json;odata=verbose',
              'odata-version': ''
            }
          }).then((response: SPHttpClientResponse) => {
    
            return response.json().then((item) => {
              custResonse = {
                error: response.ok ? undefined : JSON.stringify(item),
                nextUrl: item !== null && item.d !== null && item.d.__next !== null ? item.d.__next : undefined,
                ok: response.ok,
                result: item !== null && item.d !== null ? item.d : undefined
              };
              return Promise.resolve(custResonse);
            }).catch(error => {
              console.error(error);
              return undefined;
            });
          });
      }
}