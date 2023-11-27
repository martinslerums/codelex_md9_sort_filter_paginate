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

  loadMoreBtn: HTMLButtonElement;
  sortNameBtn: HTMLButtonElement;
  sortCapitalBtn: HTMLButtonElement;
  sortCurrencyBtn: HTMLButtonElement;
  sortLanguageBtn: HTMLButtonElement;

  apiUrl: string;
  sortOrder: string;
  loadedCountries: number;

  searchBtn: HTMLButtonElement;

  constructor(wrapper: string) {

    this.tableWrapper = document.querySelector(wrapper);
    this.table = this.tableWrapper.querySelector(".js-table");
    this.tableBody = this.table.querySelector(".js-table__body");

    this.loadMoreBtn = document.querySelector(".js-loadMore__button");

    this.sortNameBtn = document.querySelector(".js-countrySort");
    this.sortCapitalBtn = document.querySelector(".js-capitalSort");
    this.sortCurrencyBtn = document.querySelector(".js-currencySort");
    this.sortLanguageBtn = document.querySelector(".js-languageSort");

    this.countrySearch = document.querySelector(".js-countrySearch");
    this.capitalSearch = document.querySelector(".js-capitalSearch");
    this.currencySearch = document.querySelector('.js-currencySearch');
    this.languageSearch = document.querySelector('.js-languageSearch');


    this.searchBtn = document.querySelector(".js-search__Button")

    //Initialize the table when the CountryTable instance is created
    this.clearTable();

    // Setting initial count of Countries loaded on page
    this.loadedCountries = 20;
    //Setting default limit for API to laod which is 20;
    this.updateApiUrl();

    // Setting initial order for sorting
    this.sortOrder = "asc";

    this.getCountries(this.loadedCountries).then((countriesData) => {
      this.renderTable(countriesData);
    });

    this.loadMoreCountries();

    this.sortCountryName();
    this.sortCountryCapital();
    this.sortCountryCurrency();
    this.sortCountryLanguage();

    this.search()

    this.addEventToCurrencySearch();
    this.addEventToLanguageSearch();

  }

  updateApiUrl() {
    this.apiUrl = `${axiosAPI}?_limit=${this.loadedCountries}`;
  }

  clearTable() {
    this.tableBody.innerHTML = "";
  }

  getCountries(limit: number, searchParams?: { key: string, value: string }[]) {
    this.updateApiUrl();

    // Append search parameters to the API URL
    if (searchParams) {
      searchParams.forEach(param => {
        this.apiUrl += `&${param.key}=${param.value}`;
      });
    }

    return axios.get(this.apiUrl).then((countriesData) => {
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
      currencyCell.textContent = `${country.currency.name} ${country.currency.symbol}`;

      const languageCell = row.insertCell(3);
      languageCell.textContent = country.language.name;
    });
  }

  loadMoreCountries() {
    // console.log("loadmore nostrādāja");
    this.loadMoreBtn.textContent = "Load More";

    this.loadMoreBtn.addEventListener("click", () => {
      this.clearTable();
      this.loadedCountries += 20;

      this.getCountries(this.loadedCountries).then((countries) => {
        this.renderTable(countries);
      });
    });
  }

  columnSortOrder() {
    if (this.sortOrder === "asc") {
      this.sortOrder = "desc";
    } else {
      this.sortOrder = "asc";
    }
  }

  sortColumn(column: string, sortBtn: HTMLButtonElement) {
    sortBtn.addEventListener("click", () => {
      this.columnSortOrder();
      this.updateApiUrl();

      axios
        .get(`${this.apiUrl}&_sort=${column}&_order=${this.sortOrder}`)
        .then((countriesData) => {
          this.clearTable();
          this.renderTable(countriesData.data);
        });
    });
  }

  sortCountryName() {
    this.sortColumn("name", this.sortNameBtn);
  }
  sortCountryCapital() {
    this.sortColumn("capital", this.sortCapitalBtn);
  }
  sortCountryCurrency() {
    this.sortColumn("currency.name", this.sortCurrencyBtn);
  }
  sortCountryLanguage() {
    this.sortColumn("language.name", this.sortLanguageBtn);
  }

  performSearch(searchUrl: string) {

    axios.get(searchUrl).then((countriesData) => {
      this.clearTable();
      this.renderTable(countriesData.data);
    });

  }

  search() {

    this.searchBtn.addEventListener('click', () => {
      console.log('Search clicked');

      let searchParams:string = '';

      if (this.countrySearch.value.trim() !== '') {
        searchParams = `name=${this.countrySearch.value.trim()}`;
      }

      if (this.capitalSearch.value.trim() !== '') {
        searchParams = `capital=${this.capitalSearch.value.trim()}`;
      }

      const searchUrl = `${this.apiUrl}&${searchParams}`;
      this.performSearch(searchUrl);
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

}

const table = new CountryTable(".js-table__container");
