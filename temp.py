import infermedica_api, sys, json
infermedica_api.configure(app_id='f1308345', app_key='abb713ecd3ddecf6106ecf9118bfacde')

possible_conditions = []


def read_in_from_server():
    lines = sys.stdin.readlines()
    return lines[0].split(",")

def read_in_from_terminal(text):
    lines = input(text)
    return lines.split(",")

def diagnose(lines, api, request_diag):
    for line in lines:
        #print(line)
        srch = api.search(line)
        request_diag.add_symptom(srch[0]['id'], 'present')

    #request_diag.add_symptom(srch[0]['id'], 'present')
    request_diag = api.diagnosis(request_diag)
    show_res_from_api(request_diag)
    q_and_a(api, request_diag)

def show_res_from_api(request_diag):
    print(request_diag.question.text)
    print("Options:")
    for item in request_diag.question.items:
        print("  ",item['name'])

def q_and_a(api, request_diag):
    stop = 0
    new_symptoms = []
    while not stop:
        #lines = read_in_from_terminal("Answer: ")
        lines = read_in_from_server()
        for line in lines:
            if line == "exit":
                stop = 1
                break
            for item in request_diag.question.items:
                if line == item['name']:
                    new_symptoms.append(item['id'])

        for item in request_diag.question.items:
            if item['id'] in new_symptoms:
                request_diag.add_symptom(str(item['id']), "present")
            else:
                request_diag.add_symptom(str(item['id']), "absent")

        request_diag = api.diagnosis(request_diag)
        if not stop:
            show_res_from_api(request_diag)

    possible_conditions[:] = []
    for c in request_diag.conditions:
        possible_conditions.append((c['name'],c['probability'],c['id']))
        if len(possible_conditions) >= 5:
            break
    print(possible_conditions)
    print("Hope it helped :)")

def main():

    api = infermedica_api.get_api()
    request_diag = infermedica_api.Diagnosis(sex='male', age=35)
    #lines = read_in_from_terminal("Symptom: ")
    lines = read_in_from_server()
    #print(lines)
    #lines = lines.split(",")
    #print(linapies)
    #print(len(request_diag.symptoms))
    #if len(request_diag.symptoms) <= 0:
    diagnose(lines, api, request_diag)

        #for line in lines:
        #    srch = api.search(line)
        #    print(srch[0]['name'])
        #    request_diag.add_symptom(srch[0]['id'], 'present')

        ##request_diag.add_symptom(srch[0]['id'], 'present')
        #request_diag = api.diagnosis(request_diag)
        ##show_res_from_api(request_diag)
        #print(request_diag.question.text)
        #print("Options:")
        #for item in request_diag.question.items:
        #    print("  ",item['name'])
    #else:
    #     q_and_a(api, request_diag)

if __name__ == '__main__':
    main()
