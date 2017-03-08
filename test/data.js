const assert = require('assert');
const companies = require('../data/autotech.json');

describe('#Data Purity', () => {
  it('should have no duplicate data', () => {
    let companyNames = companies.map(company => company.name);
    let uniqueCompanyNames = [...new Set(companyNames)];
    assert.equal(companyNames.length, uniqueCompanyNames.length);
  });

  it('should have no missing company data', () => {
    let companyNames = companies.map(company => company.name);
    let relationships = ["mentoredBy", "foundedBy", "investedBy", "acquiredBy", "partneredWith", "mentors", "founded", "investedIn", "acquired"];
    let linkedCompanies = companies.reduce((nameList, company) => {
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

  it('should have two way relationships', () => {
    const mapping = {
      "mentoredBy": "mentors",
      "foundedBy": "founded",
      "investedBy": "investedIn",
      "acquiredBy": "acquired",
      "partneredWith": "partneredWith",
      "mentors": "mentoredBy",
      "founded": "foundedBy",
      "investedIn": "investedBy",
      "acquired": "acquiredBy"
    };

    let relationships = ["mentoredBy", "foundedBy", "investedBy", "acquiredBy", "partneredWith", "mentors", "founded", "investedIn", "acquired"];

    const companiesHash = companies.reduce((acc, curr) => {
      acc[curr.name] = curr;
      return acc;
    }, {});

    companies.forEach(company => {
      let relationshipKeys = Object.keys(company).filter(key => relationships.includes(key));

      relationshipKeys.forEach(relationship => {
        company[relationship].forEach(relatedCompany => {
          let relatedCompanyData = companiesHash[relatedCompany];
          let reverseRelationship = mapping[relationship];

          assert.ok(relatedCompanyData, `${relatedCompany} is either missing or it's name misspelt`)
          assert.ok(relatedCompanyData[reverseRelationship], `Relationship is broken btn ${relatedCompany} and ${company.name}`);
          assert.ok(relatedCompanyData[reverseRelationship].includes(company.name), `Relationship is broken btn ${relatedCompany} and ${company.name}`);
        })
      });
    });
  });

  it('should have industry data for every company', () => {
    const totalCompanies = companies.length;
    let totalCompaniesWithIndustry = companies.filter(company => company.industry).length;

    assert.equal(totalCompanies, totalCompaniesWithIndustry, `
      These companies are missing industry data: ${ companies.filter(company => !company.industry).map(company => company.name) }
    `);
  });
});
