import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

class HttpClient {
  constructor() {
    this.api = axios.create({
      baseURL: `http://api.gestao.aviait.com.br/`,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
    this.initInterceptors();
  }

  initInterceptors() {
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject({
          ...error,
          status: error?.response?.status,
          data: error?.response?.data,
        });
      }
    );

    this.api.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        if (error?.response?.status === 401) {
          await AsyncStorage.removeItem("token");
          await AsyncStorage.removeItem("user");
          
        
          Alert.alert("Sessão expirada", "Você foi desconectado devido à sessão expirada.");

        }
        return Promise.reject({
          ...error,
          status: error?.response?.status,
          data: error?.response?.data,
        });
      }
    );
  }
}

const { api } = new HttpClient();
export { api };
