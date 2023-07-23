import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GetDataService {
  url: string = '/assets/MenuList.json';
  
  
  MenuList:any;
  constructor(private http: HttpClient) { 

  }
  getMenus(){
    return this.http.get(this.url);
  }
  
}
