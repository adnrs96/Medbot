import infermedica_api
infermedica_api.configure(app_id='f1308345', app_key='abb713ecd3ddecf6106ecf9118bfacde')
api = infermedica_api.get_api()

request = infermedica_api.Diagnosis(sex='male', age=35)

request.add_symptom('s_21', 'present')
request.add_symptom('s_98', 'present')

stop = 0
possible_conditions = []
while not stop:
    request = api.diagnosis(request)
    possible_conditions[:] = []
    for c in request.conditions:
        possible_conditions.append((c['name'],c['probability'],c['id']))
        if len(possible_conditions) >= 5:
            break
    print("possible conditions: ", possible_conditions)
    print()
    print(request.question.text)
    print("Options:")
    new_symptoms = []
    for item in request.question.items:
        print(item['name'])

    while True:
        line = input()
        if line:
            if line == "exit":
                stop = 1
                break
            for item in request.question.items:
                if line == item['name']:
                    new_symptoms.append(item['id'])
        else:
            break

    print(new_symptoms)
    for item in request.question.items:
        if item['id'] in new_symptoms:
            request.add_symptom(str(item['id']), "present")
        else:
            request.add_symptom(str(item['id']), "absent")

    
print("Hope it helped :)")
