#A library to service common queries against the StarMetrics API

import urllib2, json, itertools

proposalaccessallowed = False
apiurl = 'http://rd-dashboard.nitrd.gov/star/api/'
# Check to see if we have access to nsfstarmetrics server
# This is done once when the module is loaded
try:
    urllib2.urlopen("http://128.150.10.70/py/api/access",None,2)
except urllib2.URLError:
    pass
else:
    proposalaccessallowed = True
    apiurl = "http://128.150.10.70/py/api/"

#legend placeholders
legend_topics = {} #this will come from the API
legend_divisions = {
"OCI":"Office of Cyberinfrastructure",
"OGC":"Office of the General Counsel",
"OIA":"Office of Integrative Activities",
"OISE":"Office of International Science and Engineering",
"ODI":"Office of Diversity and Inclusion (ODI)",
"OLPA":"Office of Legislative & Public Affairs",
"ANT":"Antarctic Sciences",
"ARC":"Arctic Sciences",
"AIL":"Antarctic Infrastructure and Logistics",
"PEHS":"Office of Polar Environment, Health and Safety",
"A/D":"Front Office",
"NSB":"Office of the Assistant Director",
"OIG":"Office of the Assistant Director",
"MCB":"Division of Molecular & Cellular Biosciences",
"DBI":"Division of Biological Infrastructure",
"IOS":"Division of Integrative Organismal Systems",
"DEB":"Division of Environmental Biology",
"EF":"Emerging Frontiers Office",
"CCF":"Division of Computing and Communication Foundations",
"CNS":"Division of Computer and Network Systems",
"IIS":"Division of Information and Intelligent Systems",
"DRL":"Division of Research on Learning in Formal and Informal Settings",
"DGE":"Division of Graduate Education",
"HRD":"Division of Human Resource Development",
"DUE":"Division of Undergraduate Education",
"CBET":"Division of Chemical, Bioengineering, Environmental, and Transport Systems",
"CMMI":"Division of Civil, Mechanical & Manufacturing Innovation",
"ECCS":"Division of Electrical, Communications & Cyber Systems",
"EEC":"Division of Engineering Education & Centers",
"EFRI":"Office of Emerging Frontiers in Research & Innovation",
"IIP":"Division of Industrial Innovation & Partnerships",
"ENG":"Office of the Assistant Director",
"AGS":"Division of Atmospheric and Geospace Sciences",
"EAR":"Division of Earth Sciences",
"OCE":"Division of Ocean Sciences",
"GEO":"Office of the Assistant Director",
"AST":"Division of Astronomical Sciences",
"CHE":"Division of Chemistry",
"DMR":"Division of Materials Research",
"DMS":"Division of Mathematical Sciences",
"PHY":"Division of Physics",
"MPS":"Office of the Assistant Director",
"SES":"Division of Social and Economic Sciences",
"BCS":"Division of Behavioral and Cognitive Sciences",
"NCSE":"National Center for Science and Engineering Statistics",
"SMA":"SBE Office of Multidisciplinary Activities",
"SBE":"Office of the Assistant Director",
"BD":"Budget Division",
"DACS":"Division of Acquisition and Cooperative Support",
"DFM":"Division of Financial Management",
"DGA":"Division of Grants & Agreements",
"DIAS":"Division of Institution and Award Support",
"HRM":"Division of Human Resource Management",
"DIS":"Division of Information Systems",
"DAS":"Division of Administrative Services",
"EPSCoR":"Office of Experimental Program To Stimulate Competitive Research",
"EPS":"Office of Experimental Program to Stimulate Competitive Research"
}

#RESOURCES
#exposed methods to retrieve data
#define a topics resource
def topics(options=None):
    #set up options
    if options is None:
        options = {}
    #initialized
    if 'org' not in options:
        options['org'] = ''
    if 'year' not in options:
        options['year'] = ''
    #retrieve
    t1_data = getTopics(options,'t1')
    t2_data = getTopics(options,'t2')
    t3_data = getTopics(options,'t3')
    t4_data = getTopics(options,'t4')
    collated = collateTopics(t1_data,t2_data,t3_data,t4_data)
    #set topic legends
    result = setTopicLegend(collated)

    return result

#topics legend resource
def topiclegends():
    if len(legend_topics)==0:
        return getTopicLegend()
    else:
        #return
        return legend_topics
        
#define a programs resource
def programs(options=None):
    #set up options
    if options is None:
        options = {}
    #initialized
    if 'org' not in options:
        options['org'] = ''
    if 'year' not in options:
        options['year'] = ''
    if 't' not in options:
        options['t'] = ''
    #retrieve
    data = getPrograms(options)
    result = setProgramLegend(data)

    return result

#program legend resource
def programlegends(options):
    #options is a comma separated list of pge codes
    return getProgramLegend(options)
        
#define a divisions resource
def divisions(options=None):
    #set up options
    if options is None:
        options = {}
    #initialized
    if 'org' not in options:
        options['org'] = ''
    if 'year' not in options:
        options['year'] = ''
    if 't' not in options:
        options['t'] = ''
    #retrieve
    data = getDivisions(options)
    result = setDivisionLegend(data)

    return result

#define a proposals resource
def proposals(options=None):
    #set up options
    if options is None:
        options = {}
    #initialized
    if 'org' not in options:
        options['org'] = ''
    if 'year' not in options:
        options['year'] = ''
    if 't' not in options:
        options['t'] = ''
    #retrieve
    result = getProposals(options)

    return result

#define a proposal resource
def proposal(propid):
    result = getProposal(propid)

    return result

#define a institutions resource
def institutions(options=None):
    #set up options
    if options is None:
        options = {}
    #initialized
    if 'org' not in options:
        options['org'] = ''
    if 'year' not in options:
        options['year'] = ''
    if 't' not in options:
        options['t'] = ''
    #retrieve
    result = getInstitutions(options)

    return result

#define a institution resource
def institution(instid):
    result = getInstitution(instid)

    return result

#define a researchers resource
def researchers(options=None):
    #set up options
    if options is None:
        options = {}
    #initialized
    if 'org' not in options:
        options['org'] = ''
    if 'year' not in options:
        options['year'] = ''
    if 't' not in options:
        options['t'] = ''
    if 'id' not in options:
        options['id'] = ''
    #retrieve
    result = getResearchers(options)

    return result

#define a researcher resource
def researcher(researcherid):
    result = getResearcher(researcherid)

    return result

#Lower level functions to service the resources
#topics data handling
def getTopics(params,topicrelevance):
    params['summ'] = 'status,year,'+topicrelevance #t1,t2,t3,t4
    try:
        url = apiurl+'topic?'+toParam(params)
        f = urllib2.urlopen(url)
    except urllib2.URLError:
        pass
    else:
        data = json.loads(f.read())
        f.close()
        rawdata = data["data"]

        #make a list of the years
        years = [item['year'] for item in rawdata if 'year' in item]
        years = sorted(set(years))

        #prepare data
        #group by t
        grouped = {}
        rawdata = sorted(rawdata, key = lambda row: row[topicrelevance] if topicrelevance in row else None)
        for key, group in itertools.groupby(rawdata, lambda row: row[topicrelevance] if topicrelevance in row else None):
            grouped[key] = [thing for thing in group] if group is not None else []
        #now assemble
        collated = []
        for t, group in grouped.iteritems():
            if t is not None:
                topicid = t
                tmp = {'t':topicid,'count':{'award':0,'decline':0,'other':0},'funding':{'award':0,'request':0}}
                #now reduce
                for row in group:
                    #counts and funding
                    count_awarded = 0
                    count_declined = 0
                    count_other = 0
                    funding_awarded = 0
                    funding_requested = 0
                    if row["status"]=="award":
                        funding_awarded = row["awarded_dollar"]
                        count_awarded = row["count"]
                    elif row["status"]=="decline":
                        count_declined = row["count"]
                    else:
                        count_other = row["count"]                    
                    if "request_dollar" in row: funding_requested = row["request_dollar"]
                    #save
                    tmp['count']['award'] += count_awarded
                    tmp['count']['decline'] += count_declined
                    tmp['count']['other'] += count_other
                    tmp['funding']['award'] += funding_awarded
                    tmp['funding']['request'] += funding_requested

                topic_by_year = {}
                for year in years:
                    filtered = filter(lambda item: item['year']==year, group) 
                    year_tmp = {'count':{'award':0,'decline':0,'other':0},'funding':{'award':0,'request':0}} 
                    for row in filtered:
                        awarded_count = 0
                        declined_count = 0
                        other_count = 0
                        awarded_dollar = 0
                        requested_dollar = 0
                        if row['status']=='award':
                            awarded_count = row["count"]
                            awarded_dollar = row["awarded_dollar"]
                        elif row['status']=='decline':
                            declined_count = row["count"]
                            requested_dollar = row["requested_dollar"]
                        else:
                            other_count = row["count"]
                        #save
                        year_tmp['count']['award'] += count_awarded
                        year_tmp['count']['decline'] += count_declined
                        year_tmp['count']['other'] += count_other
                        year_tmp['funding']['award'] += funding_awarded
                        year_tmp['funding']['request'] += funding_requested

                    topic_by_year[year] = year_tmp

                tmp['years'] = topic_by_year

                #save it
                collated.append(tmp)                

        #make an array hash which is much faster than an array for searching
        data_hash = {}
        for row in collated:
            data_hash[row['t']] = row

        #return
        return data_hash          

#collate topics
#take the data from 4 relevance calls and put it all together
def collateTopics(t1_data,t2_data,t3_data,t4_data):
    topicsbyrelevance = {'t1':t1_data,'t2':t2_data,'t3':t3_data,'t4':t4_data}
    loaded_topicids = []
    loaded_topics = [] #this will end up looking like [ { t:topicid, label: label, words: words, t1: {count: count, etc. }, t2: {count: count, etc. }}]
    
    loaded_topicids.extend(t1_data.keys())
    loaded_topicids.extend(t2_data.keys())
    loaded_topicids.extend(t3_data.keys())
    loaded_topicids.extend(t4_data.keys())
    
    #unqiue
    unique_topicids = set(loaded_topicids)
    #using the unique list of retrieved topic ids
    for topicid in unique_topicids:
        tmp = {'t':topicid, 'label':None, 'words':None}
        #for each relevance
        for topicrelevance in range(1,4):
            topicrelevance = 't'+str(topicrelevance)
            if topicid in topicsbyrelevance[topicrelevance]:
                topic = topicsbyrelevance[topicrelevance][topicid]
            else:
                topic = {}
            tmp[topicrelevance] = topic
        loaded_topics.append(tmp)
    
    return loaded_topics

#set topic legend
def setTopicLegend(topics):
    #load topiclegends if not loaded
    if len(legend_topics)==0:
        getTopicLegend()
        return applyTopicLegend(topics)
    else:
        return applyTopicLegend(topics)

#get topic legends
def getTopicLegend():
    try:
        f = urllib2.urlopen(apiurl+'topic?legend=topic')
    except urllib2.URLError:
        pass
    else:
        data = json.loads(f.read())
        f.close()
        for item in data:
            legend_topics[item["topic"]] = {"words":item["words"],"label":item["label"]}
    
#apply topic legends
def applyTopicLegend(topics):
    for topic in topics:
        topicid = topic['t']
        #words and labels
        if 'label' not in legend_topics[topicid]:
            label = 'Not Electronically Readable'
        else:
            label = legend_topics[topicid]["label"]
        if 'words' not in legend_topics[topicid]:
            words = ''
        else:
            words = legend_topics[topicid]["words"]

        #set
        topic['label'] = label
        topic['words'] = words

    return topics

#programs data handling
def getPrograms(params):
    params['summ'] = 'status,year,pge'
    try:
        url = apiurl+'topic?'+toParam(params)
        f = urllib2.urlopen(url)
    except urllib2.URLError:
        pass
    else:
        data = json.loads(f.read())
        f.close()
        rawdata = data["data"]

        #make a list of the years
        years = [item['year'] for item in rawdata if 'year' in item]
        years = sorted(set(years))

        #prepare data
        #group by pge
        grouped = {}
        rawdata = sorted(rawdata, key = lambda row: row['pge'])
        for key, group in itertools.groupby(rawdata, lambda row: row['pge']):
            grouped[key] = [thing for thing in group]
        #now assemble
        collated = []
        for pge, group in grouped.iteritems():
            tmp = {'pge':pge,'count':{'award':0,'decline':0,'other':0},'funding':{'award':0,'request':0}}
            #now reduce
            for row in group:
                #counts and funding
                count_awarded = 0
                count_declined = 0
                count_other = 0
                funding_awarded = 0
                funding_requested = 0
                if row["status"]=="award":
                    funding_awarded = row["awarded_dollar"]
                    count_awarded = row["count"]
                elif row["status"]=="decline":
                    count_declined = row["count"]
                else:
                    count_other = row["count"]                    
                if "request_dollar" in row: funding_requested = row["request_dollar"]
                #save
                tmp['count']['award'] += count_awarded
                tmp['count']['decline'] += count_declined
                tmp['count']['other'] += count_other
                tmp['funding']['award'] += funding_awarded
                tmp['funding']['request'] += funding_requested

            pge_by_year = {}
            for year in years:
                filtered = filter(lambda item: item['year']==year, group) 
                year_tmp = {'count':{'award':0,'decline':0,'other':0},'funding':{'award':0,'request':0}} 
                for row in filtered:
                    awarded_count = 0
                    declined_count = 0
                    other_count = 0
                    awarded_dollar = 0
                    requested_dollar = 0
                    if row['status']=='award':
                        awarded_count = row["count"]
                        awarded_dollar = row["awarded_dollar"]
                    elif row['status']=='decline':
                        declined_count = row["count"]
                        requested_dollar = row["requested_dollar"]
                    else:
                        other_count = row["count"]
                    #save
                    year_tmp['count']['award'] += count_awarded
                    year_tmp['count']['decline'] += count_declined
                    year_tmp['count']['other'] += count_other
                    year_tmp['funding']['award'] += funding_awarded
                    year_tmp['funding']['request'] += funding_requested

                pge_by_year[year] = year_tmp

            tmp['years'] = pge_by_year

            #save it
            collated.append(tmp)             

        #return
        return collated          

#set program legend
def setProgramLegend(programs):
    pges = []
    for program in programs:
        pges.append(program['pge'])

    #set program legends
    legend = getProgramLegend(','.join(pges))
    return applyProgramLegend(programs,legend)

#get program legends
def getProgramLegend(pges):
    try:
        f = urllib2.urlopen(apiurl+'prop?legend=nsf_pge&q='+pges)
    except urllib2.URLError:
        pass
    else:
        data = json.loads(f.read())
        f.close()

        return data
    
#apply program legends
def applyProgramLegend(programs,legend):
    #set the labels
    for program in programs:
        pge = filter(lambda item: item['nsf_pge']==program['pge'], legend)
        program['label'] = ''
        if pge:
            program['label'] = pge[0]['label']

    return programs            

#divisions data handling
def getDivisions(params):
    params['summ'] = 'status,year,org'
    try:
        url = apiurl+'topic?'+toParam(params)
        f = urllib2.urlopen(url)
    except urllib2.URLError:
        pass
    else:
        data = json.loads(f.read())
        f.close()
        rawdata = data["data"]

        #make a list of the years
        years = [item['year'] for item in rawdata if 'year' in item]
        years = sorted(set(years))

        #prepare data
        #group by org
        grouped = {}
        rawdata = sorted(rawdata, key = lambda row: row['org'])
        for key, group in itertools.groupby(rawdata, lambda row: row['org']):
            grouped[key] = [thing for thing in group]
        #now assemble
        collated = []
        for org, group in grouped.iteritems():
            tmp = {'org':org,'count':{'award':0,'decline':0,'other':0},'funding':{'award':0,'request':0}}
            #now reduce
            for row in group:
                #counts and funding
                count_awarded = 0
                count_declined = 0
                count_other = 0
                funding_awarded = 0
                funding_requested = 0
                if row["status"]=="award":
                    funding_awarded = row["awarded_dollar"]
                    count_awarded = row["count"]
                elif row["status"]=="decline":
                    count_declined = row["count"]
                else:
                    count_other = row["count"]                    
                if "request_dollar" in row: funding_requested = row["request_dollar"]
                #save
                tmp['count']['award'] += count_awarded
                tmp['count']['decline'] += count_declined
                tmp['count']['other'] += count_other
                tmp['funding']['award'] += funding_awarded
                tmp['funding']['request'] += funding_requested

            org_by_year = {}
            for year in years:
                filtered = filter(lambda item: item['year']==year, group) 
                year_tmp = {'count':{'award':0,'decline':0,'other':0},'funding':{'award':0,'request':0}} 
                for row in filtered:
                    awarded_count = 0
                    declined_count = 0
                    other_count = 0
                    awarded_dollar = 0
                    requested_dollar = 0
                    if row['status']=='award':
                        awarded_count = row["count"]
                        awarded_dollar = row["awarded_dollar"]
                    elif row['status']=='decline':
                        declined_count = row["count"]
                        requested_dollar = row["requested_dollar"]
                    else:
                        other_count = row["count"]
                    #save
                    year_tmp['count']['award'] += count_awarded
                    year_tmp['count']['decline'] += count_declined
                    year_tmp['count']['other'] += count_other
                    year_tmp['funding']['award'] += funding_awarded
                    year_tmp['funding']['request'] += funding_requested

                org_by_year[year] = year_tmp

            tmp['years'] = org_by_year

            #save it
            collated.append(tmp)             

        #return
        return collated          

#set division legends
def setDivisionLegend(divisions):
    for division in divisions:
        org = division['org']
        #labels
        if org not in legend_divisions:
            label = 'Not Available'
        else:
            label = legend_divisions[org]

        #set
        division['label'] = label
    
    return divisions        

#get proposals
def getProposals(params):
    params['page'] = 'grant'
    try:
        url = apiurl+'topic?'+toParam(params)
        f = urllib2.urlopen(url)
    except urllib2.URLError:
        pass
    else:
        data = json.loads(f.read())
        f.close()

        return data

#get researchers
def getResearchers(params):
    params['page'] = 'pi'
    try:
        url = apiurl+'topic?'+toParam(params)
        f = urllib2.urlopen(url)
    except urllib2.URLError:
        pass
    else:
        data = json.loads(f.read())
        f.close()

        return data

#get institutions
def getInstitutions(params):
    params['page'] = 'org'
    try:
        url = apiurl+'topic?'+toParam(params)
        f = urllib2.urlopen(url)
    except urllib2.URLError:
        pass
    else:
        data = json.loads(f.read())
        f.close()

        return data

#get proposal
def getProposal(id):
    try:
        url = apiurl+"prop?id="+id
        f = urllib2.urlopen(url)
    except urllib2.URLError:
        pass
    else:
        data = json.loads(f.read())
        f.close()

        return data

#get researcher
def getResearcher(id):
    try:
        url = apiurl+"user?id="+id
        f = urllib2.urlopen(url)
    except urllib2.URLError:
        pass
    else:
        data = json.loads(f.read())
        f.close()

        return data

#get institution
def getInstitution(id):
    try:
        url = apiurl+"org?id="+id
        f = urllib2.urlopen(url)
    except urllib2.URLError:
        pass
    else:
        data = json.loads(f.read())
        f.close()

        return data

#general use functions
def toParam(obj):
    str = ''
    separator = '&'
    for key, val in obj.iteritems():
        if val:
            if str != '':
                str += separator
            str += key + '=' + val
    return str