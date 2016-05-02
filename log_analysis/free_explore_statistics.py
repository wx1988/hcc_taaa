"""
1, the basic count
2, the usage of metadata
"""
import numpy as np

def stat_count(log_path):
    """read the log actions and statistic the count
    # get the top 20 operation, and ratio with repect to all action
    """
    event2count = {}
    lines = open(log_path).readlines()
    lines = lines[1:]
    for line in lines:
        ws = line.split(',')
        action = ws[1].strip()
        if not event2count.has_key( action ):
            event2count[action] = 0
        event2count[action] += 1
    total_count = np.sum( event2count.values() )
    action_list = event2count.keys()
    action_list = sorted( action_list, key=lambda a:-1* event2count[a])
    print total_count
    for i in range(20):
        print "%s, %d, %f"%(
                action_list[i], 
                event2count[action_list[i]],
                event2count[action_list[i]]/ float(total_count)
                )
    print action_list


def stat_facet(log_path):
    """
    # rank the facet based on the number of operation 
    """
    pass


if __name__ == "__main__":
    stat_count('expert_free.csv')
    print ""
    stat_count('non_expert_free.csv')
    
    pass
