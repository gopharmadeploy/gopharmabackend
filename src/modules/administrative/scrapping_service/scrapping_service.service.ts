import { CreateScrappingServiceDto } from './dto/create-scrapping_service.dto';
import { UpdateScrappingServiceDto } from './dto/update-scrapping_service.dto';
import {
    HttpException,
    Inject,
    Injectable,
    InternalServerErrorException,
    forwardRef,
} from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { ExchangeRateService } from '../exchange_rate/exchange_rate.service';


@Injectable()
export class ScrappingServiceService {
    private readonly url = 'https://www.bcv.org.ve/';

  constructor(
    @Inject(forwardRef(() => ExchangeRateService))
    private readonly exchangeRateService: ExchangeRateService,

  ) { }

    // 1 DOLAR
    // 2 BOLIVAR
    // 3 EURO



  /**
   * Obtiene las tasas de cambio desde el sitio web del BCV y las guarda en la base de datos.
   */
  async getExchangeRates(): Promise<any> {
   //console.log("Ejecutando cron...");

   var resultMessage = {
    "conn": 200,
    "usd": 0,
    "eur": 0,
    "usdRate": 0,
    "eurRate": 0
  };
    try {
      const response = await axios.get(this.url, { timeout: 30000 });
      const $ = cheerio.load(response.data);

            const usdHtml = $('#dolar').html();
            const eurHtml = $('#euro').html();

      if((!usdHtml) || (!eurHtml) ){throw new HttpException("La tasa no pudo ser obtenida, posiblemente hubo un cambio en el sitio del BCV, contactar al desarrollador (0)",500)}
  
      resultMessage.usdRate = this.getChange(usdHtml)
      resultMessage.eurRate = this.getChange(eurHtml)

      resultMessage.usd = await this.createExchangeRate(1, resultMessage.usdRate);
      resultMessage.eur = await this.createExchangeRate(3, resultMessage.eurRate);

      return resultMessage;

    } catch (error) {

      console.log("OCURRIÓ UN ERROR EN EL SCRAPPING",error.cause, error.code)


      if (error.code === 'ECONNABORTED' || error.code === "ECONNRESET" || error.code === "ENOTFOUND" || error.code === 'ETIMEDOUT') {

        console.log('No se logró establecer conexión con bcv.org');
       resultMessage.conn = 503;

        
      } else {

        // Error inesperado
        resultMessage.conn = 500;

      }
      return resultMessage;
    }
  }

    /**
     * Extrae y parsea el valor de cambio de la tasa desde el HTML.
     */
    private getChange(html: string): number {
        try {
            const $ = cheerio.load(html);
            const element = $('strong');
            let text = element.text().trim();
            text = text.replace(',', '.');
            const rate = parseFloat(text);

            if (isNaN(rate)) {
                throw new HttpException(
                    'La tasa no pudo ser obtenida, posiblemente hubo un cambio en el sitio del BCV, contactar al desarrollador (1)',
                    500,
                );
            }

      //console.log("rate:", rate)
      //console.log(rate)
      return rate;

    } catch (error) {
      throw new HttpException("La tasa no pudo ser obtenida, posiblemente hubo un cambio en el sitio del BCV, contactar al desarrollador (2)",500)
    }

  }

    /**
     * Crea una tasa de cambio y maneja los posibles errores.
     */
    private async createExchangeRate(currencyId: number, exchangeRate: number) {
        try {
            const res = await this.exchangeRateService.create(
                {
                    currencyId,
                    exchangeToCurrency: 2,
                    exchange: exchangeRate,
                },
                null,
            );

            if (res.includes('¡Tasa de cambio creada con éxito!')) {
                return 201;
            } else {
                return 500;
            }
        } catch (error) {
            return this.handleServiceError(error, currencyId === 1 ? 'USD' : 'EUR');
        }
    }

  /**
   * Maneja errores específicos del servicio de creación de tasas de cambio.
   */
  private handleServiceError(error: any, currency: string) {
    //console.log(`Error al crear tasa de cambio para ${currency}`, error.response);
   // console.log("Error recived from ExchangeService", error.status)
    if (error.status === 409) {
      return error.status;
    } else {
      return 500;
    }

  }
}
