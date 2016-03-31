#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <fcntl.h>
#include <signal.h>
#include <errno.h>

#define BUF_SIZE 8192

void signal_handler(int signum) {
	signal(SIGSEGV, signal_handler);
	fprintf(stderr, "Caught SIGSEGV\n");
	exit(3);
}

int main(int argc, char *argv[]) {
	char *input = '\0';
	char *output = '\0';
	int segfault = 0;
	int catch = 0;
	
for (int i = 1; i < argc; i++) {
	if (strstr(argv[i], "--input=") != NULL) {
		strncpy(input, argv[i], strlen(argv[i]) - strlen("--input=")) ;
		printf("hello%s\n",input);
}
	if (strstr(argv[i], "--output=") != NULL) {
		strncpy(output, argv[i], strlen(argv[i]) - strlen("--output=")) ;
}
	if (strcmp(argv[i], "--segfault") == 0)
		segfault = 1;
	if (strcmp(argv[i], "--catch") == 0)
		segfault = 1;
}
int fd0, fd1;
char *buffer;
buffer = malloc(BUF_SIZE);
fd0 = open(input, O_RDONLY);
if (fd0 < 0) {
	char *str;
	perror(str);
	fprintf(stderr, "%s\n", str);
	exit(1);
}
fd1 = creat(output, 0666);
if (fd1 < 0) {
	char *str;
	perror(str);
	fprintf(stderr, "%s\n", str);
	exit(2);
}
if (segfault) {
	char * p = NULL;
	buffer = p;
}
if (catch) {
	signal(SIGSEGV, signal_handler);
}
while(read(fd0, buffer, BUF_SIZE) > 0) {
	write(fd1, buffer, BUF_SIZE); 
}
free(buffer);
close(fd0);
close(fd1);
exit(0);
}
