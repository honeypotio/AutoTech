var assert = require('assert');
var companies = require('../data/autotech.json');

describe('#Data Purity', () => {
  it('Check for duplicate data', function() {
    var companyNames = companies.map(company => company.name);
    var uniqueCompanyNames = [...new Set(companyNames)];
    assert.equal(companyNames.length, uniqueCompanyNames.length);
  });

  it('Check for missing company data', function() {
    var companyNames = companies.map(company => company.name);
    var relationships = ["mentoredBy", "foundedBy", "investedBy", "acquiredBy", "partneredWith", "mentors", "founded", "investedIn", "acquired"];
    var linkedCompanies = companies.reduce((nameList, company) => {
      relationships.forEach(rel => {
        if (company[rel]) {
          company[rel].forEach(linkedCompany => {
            if (nameList.indexOf(linkedCompany) === -1) {
              nameList.push(linkedCompany);
            }
          });
        }
      });
      return nameList;
    }, []);
    
    assert.equal(companyNames.length, linkedCompanies.length);
  });
});
