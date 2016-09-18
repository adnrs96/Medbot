import infermedica_api, sys, json, ast
infermedica_api.configure(app_id='bc057cc8', app_key='cb1d56dafc45383462d1bcbe754c9033')

possible_conditions = []

def read_in_from_server():
    lines = sys.stdin.readlines()[0]
    lines = json.loads(lines)
    return (lines)


def read_in_from_terminal(text):
    lines = input(text)
    return lines.split(",")

def convert_to_json(request):
    r = {}
    r['case_id'] = request.case_id
    r['conditions'] = [c for c in request.conditions]
    r['evaluation_time'] = request.evaluation_time
    r['extras'] = request.extras
    r['extras_permanent'] = request.extras_permanent
    r['lab_tests'] = request.lab_tests
    r['patient_age'] = request.patient_age
    r['patient_sex'] = request.patient_sex
    r['pursued'] = request.pursued
    r['question'] = {}
    r['question']['extras'] = request.question.extras
    r['question']['items'] = [item for item in request.question.items]
    r['question']['text'] = request.question.text
    r['question']['type'] = request.question.type
    r['risk_factors'] = request.risk_factors
    r['symptoms'] = request.symptoms
    return r

def diagnose(lines, api, request_diag):

    for line in lines:
        request_diag.add_symptom(line['id'],line['choice_id']);

    request_diag = api.diagnosis(request_diag)
    request = convert_to_json(request_diag)
    request = json.dumps(request)
    print(request)

def main():
    api = infermedica_api.get_api()
    request_diag = infermedica_api.Diagnosis(sex='male', age=35)
    lines = read_in_from_server()
    #print(lines)
    diagnose(lines, api, request_diag)

#def show_res_from_api(request_diag):
#    print(request_diag.question.text)
#    print("Options:")
#    for item in request_diag.question.items:
#        print("  ",item['name'])
#
#def q_and_a(api, request_diag):
#    print("q and a")
#    stop = 0
#    new_symptoms = []
#    while not stop:
#        #lines = read_in_from_terminal("Answer: ")
#        #print(len(sys.stdin.readlines()))
#        lines = read_in_from_server()
#        for line in lines:
#            if line == "exit":
#                stop = 1
#                break
#            for item in request_diag.question.items:
#                if line == item['name']:
#                    new_symptoms.append(item['id'])
#
#        for item in request_diag.question.items:
#            if item['id'] in new_symptoms:
#                request_diag.add_symptom(str(item['id']), "present")
#            else:
#                request_diag.add_symptom(str(item['id']), "absent")
#
#        request_diag = api.diagnosis(request_diag)
#        if not stop:
#            show_res_from_api(request_diag)
#
#    possible_conditions[:] = []
#    for c in request_diag.conditions:
#        possible_conditions.append((c['name'],c['probability'],c['id']))
#        if len(possible_conditions) >= 5:
#            break
#    print(possible_conditions)
#    print("Hope it helped :)")
#



if __name__ == '__main__':
    main()
