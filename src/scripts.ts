import axios from "axios";

type Country = {
  name: string;
  code: string;
  capital: string;
  region: string;
  currency: { code: string; name: string; symbol: string };
  language: {
    code: string;
    iso639_2: string;
    name: string;
    nativeName: string;
  };
  flag: string;
  dialling_code: string;
  isoCode: string;
};

const axiosAPI: string = "http://localhost:3004/countries";

class CountryTable {

  tableWrapper: HTMLDivElement;
  table: HTMLTableElement;
  tableBody: HTMLTableSectionElement;
  countrySearch: HTMLInputElement;
  capitalSearch: HTMLInputElement;
  currencySearch: HTMLInputElement;
  languageSearch: HTMLInputElement;
  loadedCountries: number;
  loadMoreBtn: HTMLButtonElement;
  sortBtn: HTMLButtonElement;

  constructor(wrapper: string) {

    this.tableWrapper = document.querySelector(wrapper);
    this.table = this.tableWrapper.querySelector(
      ".js-table"
    ) as HTMLTableElement;
    this.tableBody = this.table.querySelector(
      ".js-table__body"
    ) as HTMLTableSectionElement;
  

    this.countrySearch = document.querySelector('.js-countrySearch');
    this.capitalSearch = document.querySelector('.js-capitalSearch');
    this.currencySearch = document.querySelector('.js-currencySearch');
    this.languageSearch = document.querySelector('.js-languageSearch');

    this.loadMoreBtn = document.querySelector('.js-loadMore__button');
    this.sortBtn = document.querySelector('.js-countrySort')


    //Initialize the table when the CountryTable instance is created
    this.clearTable();
   
    // Setting initial count of Countries loaded on page
    this.loadedCountries = 20;

    
    this.getCountries(this.loadedCountries).then((countriesData) => {
      this.renderTable(countriesData);
    });
    
      this.addEventToCountrySearch();
      this.addEventToCapitalSearch();
      this.addEventToCurrencySearch();
      this.addEventToLanguageSearch();

      this.loadMoreCountries();
      this.sortCountryName();
  }

  clearTable() {
    this.tableBody.innerHTML = "";
  }

  getCountries(limit: number, searchParams?: { key: string, value: string }[]) {

    let apiUrl = `${axiosAPI}?_limit=${limit}`;

    // Append search parameters to the API URL
    if (searchParams) {
      searchParams.forEach(param => {
        apiUrl += `&${param.key}=${param.value}`;
      });
    }
  
    return axios.get(apiUrl)
      .then((countriesData) => {
        const countries = countriesData.data;
        return countries;
      });

  }

  renderTable(countries: Country[]) {

    countries.forEach((country: Country) => {

      const row = this.tableBody.insertRow();

      const nameCell = row.insertCell(0);
      nameCell.textContent = country.name;

      const capitalCell = row.insertCell(1);
      capitalCell.textContent = country.capital;

      const currencyCell = row.insertCell(2);
      currencyCell.textContent = country.currency.name;

      const languageCell = row.insertCell(3);
      languageCell.textContent = country.language.name;

    });
  }


  addEventToCountrySearch() {
    this.countrySearch.addEventListener('input', () => {
      this.searchCountry();
    });
  }
  addEventToCapitalSearch() {
    this.capitalSearch.addEventListener('input', () => {
      this.searchCapital();
    });
  }
  addEventToCurrencySearch() {
    this.currencySearch.addEventListener('input', () => {
      this.searchCurrency();
    });
  }
  addEventToLanguageSearch() {
    this.languageSearch.addEventListener('input', () => {
      this.searchLanguage();
    });
  }

  searchCountry() {
    //Create the search term from the input field
    const searchTerm = this.countrySearch.value.toLowerCase();

    // Call the getCountries method without a limit to filter ovr all of the countries within database
    this.getCountries(Number.MAX_SAFE_INTEGER).then((countries: Country[]) => {
  
      const filteredCountries = countries.filter((country: Country) =>
        country.name.toLowerCase().includes(searchTerm)
      );

      this.clearTable();
      this.renderTable(filteredCountries);
    });
  }
  searchCapital() {
    const searchTerm = this.capitalSearch.value.toLowerCase();
    // "_like" works for JSON Server - pattern matching
    const searchParams = [{ key: 'capital_like', value: searchTerm }];
  
    this.getCountries(this.loadedCountries, searchParams).then((countries) => {
      this.clearTable();
      this.renderTable(countries);
    });
  }
  searchCurrency() {
    const searchTerm = this.currencySearch.value.toLowerCase();
    const searchParams = [{ key: 'currency.name_like', value: searchTerm }];
  
    this.getCountries(this.loadedCountries, searchParams).then((countries) => {
      this.clearTable();
      this.renderTable(countries);
    });
  }
  searchLanguage() {
    const searchTerm = this.languageSearch.value.toLowerCase();
    const searchParams = [{ key: 'language.name_like', value: searchTerm }];
  
    this.getCountries(this.loadedCountries, searchParams).then((countries) => {
      this.clearTable();
      this.renderTable(countries);
    });
  }
  
  loadMoreCountries() {
    // console.log("loadmore nostrādāja");

    this.loadMoreBtn.textContent = 'Load More';

    this.loadMoreBtn.addEventListener('click', () => {
        this.clearTable();
        this.loadedCountries += 20;
        this.getCountries(this.loadedCountries).then((countries) => {
          this.renderTable(countries);
        });
    })
    
  }

  sortCountryName() {
    this.sortBtn.addEventListener('click', () => {
      
      axios.get(`${axiosAPI}?_sort=name&_order=desc`).then((countriesData) => {
         this.clearTable();
         this.renderTable(countriesData.data);
      })
    })
  }


}

const table = new CountryTable(".js-table__container");

