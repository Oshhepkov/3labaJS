var request = require('request');
var address = 'http://www.rbc.ru';

var visitedUrls=[];
var foundEmails=[];
var emailsNumber = 0;
var limit = 10;

var emailRegex = /\b[\d\w_.+-]+@[\d\w-]+.[\d\w.]+/ig;
var reg1 = '<a href=[\'\"]';
var reg2 = '[:/.A-z?<_&\s=>0-9;-]+[\'\"]';
var linksRegex = new RegExp(reg1 + 
              escapeRegExp(address) + 
              reg2, "ig");

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function isUriImage(uri) {
    
    uri = uri.split('?');
    if (typeof(uri) != "undefined" && uri) {
        uri = uri[0];
    }
    
    var parts = uri.split('.');
    
    var extension = parts[parts.length-1];
    
    var imageTypes = ['jpg','jpeg','tiff','png','gif','bmp'];
    
    if(imageTypes.indexOf(extension) !== -1) {
        return true;   
    }
}

scrape(address,0);

function scrape(url, loop)
{
	loop+=1;
    request(url, function (err,res,body) 
    {
        if (err) {
            var c = err;
          
        }
        else {
            var emails=body.match(emailRegex);
            if(typeof(emails)!= "undefined" && emails) {
                for (i = 0; i < emails.length; i++) {
                    if (foundEmails.indexOf(emails[i]) == -1) {
                        foundEmails.push(emails[i]);
                    }
                }
            }
            
            var links=body.match(linksRegex);
            if (typeof(links) != "undefined" && links) {
                for (i = 0; i < links.length; i++) {
                    links[i] = links[i].split('\"')[1].toLowerCase();
                }

                for(i=0; i<links.length; i++)
                {
                    if (visitedUrls.indexOf(links[i]) == -1 && loop<limit && !isUriImage(links[i])) {
                        var nextPage = links[i];
                        scrape(nextPage, loop);
                        visitedUrls.push(nextPage);
                        console.log(nextPage);
                    }
                }   
            }
        }
        
        if (emailsNumber < foundEmails.length) 
        {
            console.log("(" + foundEmails.length + ") Emails: " + foundEmails + "\n ---------");
            emailsNumber = foundEmails.length;
        }
    });
}